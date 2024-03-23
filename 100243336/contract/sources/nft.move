module me::nft {
    use std::signer;
    use std::vector;

    use std::string::{Self, String, utf8};
    use std::debug::print;

    use aptos_std::string_utils;
    use aptos_framework::event;
    use aptos_framework::object::{Self, ObjectCore, Object};
    use aptos_framework::account;
    use aptos_framework::aptos_account;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::{Self, AptosCoin};
    use aptos_token_objects::token;
    use aptos_token_objects::aptos_token::{Self, AptosToken};
    use aptos_token_objects::property_map;

    // event
    #[event]
    struct MintEvent has drop, store {
        owner: address,
        token: address,
        idx: u64
    }

    // contract data
    const NftTotalSuply: u64 = 4;
    const ResourceAccountSeed: vector<u8> = b"Neighbor Parking";
    const CollectionName: vector<u8> = b"Neighbor Parking";
    const CollectionURI: vector<u8> = b"ipfs://QmWmgfYhDWjzVheQyV2TnpVXYnKR25oLWCB2i9JeBxsJbz";
    const CollectionDescription: vector<u8> = b"Neighbor Parking Spots";
    const TokenBaseName: vector<u8> = b"slot #";
    const CarNumberProperty: vector<u8> = b"car_number";
    // exception
    const NotStartPurchase: u64 = 500001;
    const NotSetPrice: u64 = 500002;
    const TokenOutOfSuply: u64 = 500003;

    // Onchain data
    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    struct OnChainConfig has key {
        signer_cap: account::SignerCapability,
        index: u64,
        status: bool,
        price: u64,
        payee: address,
        image_urls: vector<String>
    }

    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    struct ParkingSpot has key {
        mutator_ref: token::MutatorRef
    }

    // move collection to a resource account
    fun init_module(account: &signer) {
        let (resource_signer, signer_cap) = account::create_resource_account(account, ResourceAccountSeed);
        aptos_token::create_collection(
            &resource_signer,
            string::utf8(CollectionDescription),
            NftTotalSuply, // max supply
            string::utf8(CollectionName),
            string::utf8(CollectionURI),
            true, // mutable_description: bool,
            true, // mutable_royalty: bool,
            true, // mutable_uri: bool,
            true, // mutable_token_description: bool,
            true, // mutable_token_name: bool,
            true, // mutable_token_properties: bool,
            true, // mutable_token_uri: bool,
            true, // tokens_burnable_by_creator: bool,
            true, // tokens_freezable_by_creator: bool,
            10, // royalty_numerator: u64,
            100000 // royalty_denominator: u64,
        );

        let on_chain_config = OnChainConfig {
            signer_cap,
            index: 0, // token start from 1
            status: false, // manually set by developer
            price: 0, // manually set by developer
            payee: signer::address_of(account),
            image_urls: vector<String>[
                string::utf8(b"http://localhost:8000/parkingSlot1.png"),
                string::utf8(b"http://localhost:8000/parkingSlot2.png"),
                string::utf8(b"http://localhost:8000/parkingSlot3.png"),
                string::utf8(b"http://localhost:8000/parkingSlot4.png"),
            ]
        };
        move_to(account, on_chain_config);
    }

    public fun buy_parkng_slot(
        sender: &signer,
        nft_address: address,
        car_number: String
    ): Object<AptosToken> acquires OnChainConfig {
        let config = borrow_global_mut<OnChainConfig>(nft_address);
        // assert
        assert!(config.status == true, NotStartPurchase);
        assert!(config.price > 1, NotSetPrice);
        // payment
        let coins = coin::withdraw<AptosCoin>(sender, config.price);
        coin::deposit(config.payee, coins);
        // mint token
        let index: u64 = config.index;
        assert!(index < NftTotalSuply, TokenOutOfSuply);
        let resource_signer = account::create_signer_with_capability(&config.signer_cap);
        let name = get_token_name(TokenBaseName, index);
        let url = *vector::borrow(&config.image_urls, index);
        config.index = index + 1;
        let token_object = aptos_token::mint_token_object(
            &resource_signer,
            string::utf8(CollectionName),
            string::utf8(CollectionURI),
            name,
            url,
            vector<String>[], // property keys
            vector<String>[], // property types
            vector<vector<u8>>[], // property values
        );
        // add a string
        aptos_token::add_typed_property(&resource_signer, token_object, string::utf8(CarNumberProperty), car_number );
        // transfer
        object::transfer(&resource_signer, token_object, signer::address_of(sender));
        event::emit(
            MintEvent {
                owner: signer::address_of(sender),
                token: signer::address_of(&resource_signer),
                idx: index
            }
        );
        token_object
    }

    // Entry functions
    public entry fun buy_parkng_slot_entry(
        account: &signer,
        nft_address: address,
        car_name: vector<u8>
    ) acquires OnChainConfig {
        buy_parkng_slot(account, nft_address, string::utf8(car_name));
    }

    public entry fun change_car_number(
        account: &signer,
        nft_address: address,
        token: Object<AptosToken>,
        car_number: String
    ) acquires OnChainConfig {
        // many nft of same type can under one account, so must input nft address
        assert!(object::is_owner(token, signer::address_of(account)), 1);
        let config = borrow_global_mut<OnChainConfig>(nft_address);
        let resource_signer = account::create_signer_with_capability(&config.signer_cap);
        aptos_token::update_typed_property<AptosToken, String>(&resource_signer, token, string::utf8(CarNumberProperty), car_number);
    }

    public entry fun update_config(
        account: &signer,
        status: bool,
        price: u64
    ) acquires OnChainConfig {
        let on_chain_config = borrow_global_mut<OnChainConfig>(signer::address_of(account));
        assert!(price > 1, NotSetPrice);
        on_chain_config.status = status;
        on_chain_config.price = price;
    }

    public entry fun burn_nft(
        account: &signer,
        nft_address: address,
        token: Object<AptosToken>
    ) acquires OnChainConfig {
        assert!(object::is_owner(token, signer::address_of(account)), 1);
        let config = borrow_global_mut<OnChainConfig>(nft_address);
        let resource_signer = account::create_signer_with_capability(&config.signer_cap);
        aptos_token::burn(&resource_signer, token);
    }

    // view function
    #[view]
    public fun get_config_state_price(
        account: address
    ): (bool, u64)  acquires OnChainConfig{
        let on_chain_config = borrow_global<OnChainConfig>(account);
        (on_chain_config.status, on_chain_config.price)
    }


    // private function
    fun get_token_name(token_base_name: vector<u8>, index: u64): String {
        let token_name_str = string::utf8(token_base_name);
        let token_index = string_utils::to_string(&index);
        string::append(&mut token_name_str, token_index);
        token_name_str
    }

    #[test(sender = @me, minter = @me, fx = @0x1)]
    fun test_mint(sender: &signer, minter: &signer, fx: &signer) acquires OnChainConfig {
        account::create_account_for_test(signer::address_of(sender));
        // Get  Aptos Coin
        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(fx);
        // Mint Aptos Coin and Transfer
        aptos_account::deposit_coins(signer::address_of(sender), coin::mint(
            1000 * 10000_0000,
            &mint_cap
        ));
        assert!(coin::balance<AptosCoin>(signer::address_of(sender)) == 1000 * 10000_0000 ,135);
        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
        // create collection
        init_module(sender);
        // manually start the buy
        update_config(sender, true, 2);
        // view func
        let (a, b) = get_config_state_price(signer::address_of(sender));
        print(&a);
        print(&b);
        // mint
        buy_parkng_slot_entry(minter, signer::address_of(sender));
        let token_address: Object<AptosToken> = buy_parkng_slot(minter, signer::address_of(sender), string::utf8(b"JXC123450"));
        // change some string field
        change_car_number(sender, signer::address_of(sender), token_address, string::utf8(b"cjb54312"));
        // read property
        let car_number = property_map::read_string(&token_address, &string::utf8(CarNumberProperty));
        print(&car_number)
    }
}
