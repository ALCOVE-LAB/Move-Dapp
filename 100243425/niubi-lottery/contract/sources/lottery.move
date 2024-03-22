module lottery_addr::lottery {
    use std::error;
    use std::signer;
    use std::signer::address_of;
    use std::vector;
    use std::string::{Self, String};

    use aptos_framework::event;
    use aptos_framework::coin;
    use aptos_framework::account;
    use aptos_framework::timestamp;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::randomness;
    use aptos_framework::object::{Self, Object};

    use aptos_token_objects::token;
    use aptos_token_objects::aptos_token::{Self, AptosToken};
    #[test_only]
    use aptos_std::debug::print;

    const ENOT_START: u64 = 4;
    const ENOT_A_TICKET: u64 = 1;
    const ENOT_CREATOR: u64 = 2;
    const EINVALID_TYPE: u64 = 3;
    const ENOT_AUTHORIZED: u64 = 5;
    struct OnChainConfig has key {
        signer_cap: account::SignerCapability,
        collection: String,
        index: u64,
        status: bool,
        price: u64,
        payee: address,
        description: String,
        name: String,
        image_urls: vector<String>
    }

    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    struct Ticket has key {
        mutator_ref: token::MutatorRef
    }

    struct LotteryResults has key, store, drop {
        history: vector<LotteryResult>
    }

    struct LotteryResult has key, store, drop {
        red: vector<u8>,
        blue: u8,
        timestamp: u64
    }

    struct PurchasedTickets has key{
        tickets: vector<Numeros>
    }

    struct Numeros has key, store, drop, copy {
        numeros: string::String,
        timestamp: u64
    }

    #[event]
    struct MintEvent has drop, store {
        owner: address,
        token_id: address,
        numeros: string::String,
        timestamp: u64
    }

    fun init_module(account: &signer) {
        let collection = string::utf8(b"Niubi Collection!");
        let (resource_signer, signer_cap) = account::create_resource_account(account, b"Niubi");
        aptos_token::create_collection(
            &resource_signer,
            string::utf8(b"Niubi Collection for selling lottery. Acheaver your dream =.="),
            10000000, // max supply
            collection, // collection name
            string::utf8(b"collection uri"), // collection uri
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
            collection,
            index: 0,
            status: true,
            price: 200000000u64,
            payee: signer::address_of(account),
            description: string::utf8(b"This is description for niubi lottery!"),
            name: string::utf8(b"This is name for niubi lottery!"),
            image_urls: vector<String>[
                string::utf8(b"https://k.sinaimg.cn/n/sinakd20200810ac/200/w600h400/20200810/f3fd-ixreehn5060223.jpg/w700d1q75cms.jpg"),
                string::utf8(b"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxGeXfPXAL88nYATTZz7YkdwVM0xrC09bBkQ&usqp=CAU")]
        };
        move_to(account, on_chain_config);
    }

    // public entry fun init_mint(account: &signer,
    // ) {
    //     let collection = string::utf8(b"Cat Quest!");
    //     let (resource_signer, signer_cap) = account::create_resource_account(account, b"cat");
    //     aptos_token::create_collection(
    //         &resource_signer,
    //         string::utf8(b"collection description"),
    //         1000000, // max supply
    //         collection, // collection name
    //         string::utf8(b"collection uri"), // collection uri
    //         true, // mutable_description: bool,
    //         true, // mutable_royalty: bool,
    //         true, // mutable_uri: bool,
    //         true, // mutable_token_description: bool,
    //         true, // mutable_token_name: bool,
    //         true, // mutable_token_properties: bool,
    //         true, // mutable_token_uri: bool,
    //         true, // tokens_burnable_by_creator: bool,
    //         true, // tokens_freezable_by_creator: bool,
    //         10, // royalty_numerator: u64,
    //         100000 // royalty_denominator: u64,
    //     );
    //
    //     let on_chain_config = OnChainConfig {
    //         signer_cap,
    //         collection,
    //         index: 0,
    //         status: false,
    //         price: 0,
    //         payee: signer::address_of(account),
    //         description: string::utf8(b"This is description!"),
    //         name: string::utf8(b"This is name"),
    //         image_urls: vector<String>[
    //             string::utf8(b"https://k.sinaimg.cn/n/sinakd20200810ac/200/w600h400/20200810/f3fd-ixreehn5060223.jpg/w700d1q75cms.jpg"),
    //             string::utf8(b"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxGeXfPXAL88nYATTZz7YkdwVM0xrC09bBkQ&usqp=CAU")]
    //     };
    //     move_to(account, on_chain_config);
    // }

    entry fun update_config(
        account: &signer,
        status: bool,
        price: u64
    ) acquires OnChainConfig {
        let on_chain_config = borrow_global_mut<OnChainConfig>(signer::address_of(account));
        on_chain_config.status = status;
        on_chain_config.price = price;
    }

    entry fun public_do_lottery(sender: &signer) acquires LotteryResults {
        do_lottery(sender)
    }

    fun do_lottery(
        sender: &signer) acquires LotteryResults {
        assert!(signer::address_of(sender)==@lottery_addr, error::permission_denied(ENOT_AUTHORIZED));
        let result_red = vector::empty<u8>();
        while(vector::length(&result_red) < 6) {
            let red = randomness::u8_range(1,34);
            if (!vector::contains(&result_red, &red)) {
                vector::push_back(&mut result_red, red);
            }
        };
        let blue = randomness::u8_range(1, 17);

        if (!exists<LotteryResults>(address_of(sender))) {
            let lotteryResults = LotteryResults {
                history: vector::empty(),
            };

            move_to(sender, lotteryResults);
        };
        let lotteryResults = borrow_global_mut<LotteryResults>(address_of(sender));
        let lotteryResult = LotteryResult {
            red: result_red,
            blue,
            timestamp: timestamp::now_microseconds()
        };
        let length = vector::length(&lotteryResults.history);
        vector::insert(&mut lotteryResults.history, length, lotteryResult);
    }
    entry public fun buy_ticket(
        sender: &signer,
        red: vector<string::String>,
        blue: string::String
    ) acquires OnChainConfig, PurchasedTickets {
        let config = borrow_global_mut<OnChainConfig>(@lottery_addr);
        // for sale check
        // assert!(config.status, ENOT_START);

        // payment
        let coins = coin::withdraw<AptosCoin>(sender, config.price);
        coin::deposit(config.payee, coins);
        // mint token
        vector::push_back(&mut red, blue);
        let numeros = * vector::borrow(&red, 0);
        let red2 = vector::borrow(&red, 1);
        string::append(&mut numeros, * red2);
        let red3 = vector::borrow(&red, 2);
        string::append(&mut numeros, * red3);
        let red4 = vector::borrow(&red, 3);
        string::append(&mut numeros, * red4);
        let red5 = vector::borrow(&red, 4);
        string::append(&mut numeros, * red5);
        let red6 = vector::borrow(&red, 5);
        string::append(&mut numeros, * red6);
        string::append(&mut numeros, blue);

        // create purchased ticket list
        if (!exists<PurchasedTickets>(address_of(sender))) {
            let purchasedTickets = PurchasedTickets {
                tickets: vector::empty(),
            };
            move_to(sender, purchasedTickets);
        };
        let purchasedTickets = borrow_global_mut<PurchasedTickets>(address_of(sender));
        let newMumeros = Numeros {
            numeros: numeros,
            timestamp: timestamp::now_microseconds()
        };
        let length = vector::length(&purchasedTickets.tickets);
        vector::insert(&mut purchasedTickets.tickets, length, copy newMumeros);
        create(sender, config, numeros, newMumeros.timestamp);
        config.index = config.index + 1;
    }

    inline fun get_ticket(creator: &address, collection: &String, name: &String): (Object<Ticket>, &Ticket) {
        let token_address = token::create_token_address(
            creator,
            collection,
            name,
        );
        (object::address_to_object<Ticket>(token_address), borrow_global<Ticket>(token_address))
    }

    fun create(
        creator: &signer,
        onchain_config: &OnChainConfig,
        numeros: string::String,
        timestamp: u64
    ) {
        let resource_signer = account::create_signer_with_capability(&onchain_config.signer_cap);
        // pull randomness here
        // let random_num = randomness::u64_range(0, 2);
        let url = *vector::borrow(&onchain_config.image_urls, 1);
        let name = get_token_name(onchain_config.name, onchain_config.index + 1);
        let token_object = aptos_token::mint_token_object(
            &resource_signer,
            onchain_config.collection,
            numeros,
            name,
            url,
            vector<String>[], // property keys
            vector<String>[], // property types
            vector<vector<u8>>[], // property values

        );
        event::emit(
            MintEvent {
                owner: signer::address_of(creator),
                token_id: object::owner(token_object),
                numeros: numeros,
                timestamp: timestamp
            }
        );

        object::transfer(&resource_signer, token_object, signer::address_of(creator));
    }

    fun get_token_name(token_base_name: String, index: u64): String {
        let num_string = num_to_index_string(index);
        string::append(&mut token_base_name, num_string);
        token_base_name
    }

    fun num_to_index_string(num: u64): String {
        let index_string = string::utf8(b" #");
        let num_string = num_to_string(num);
        string::append(&mut index_string, num_string);
        index_string
    }

    fun num_to_string(num: u64): String {
        let num_vec = vector::empty<u8>();
        if (num == 0) {
            vector::push_back(&mut num_vec, 48);
        } else {
            while (num != 0) {
                let mod = num % 10 + 48;
                vector::push_back(&mut num_vec, (mod as u8));
                num = num / 10;
            };
        };

        vector::reverse(&mut num_vec);
        string::utf8(num_vec)
    }

    // reveal mystery box
    entry fun reveal(account: &signer, token: Object<AptosToken>, uri: String) acquires OnChainConfig {
        let onchain_config = borrow_global_mut<OnChainConfig>(signer::address_of(account));
        let resource_signer = account::create_signer_with_capability(&onchain_config.signer_cap);
        aptos_token::set_uri(&resource_signer, token, uri);
    }

    #[test(sender=@0x47f29684fbadb535f3e4731d9523b4852e5bebccb513475ce8c4c47353cbc82b)]
    fun test_do_lottery(
        sender: &signer) {
        assert!(signer::address_of(sender)==@lottery_addr, error::permission_denied(ENOT_AUTHORIZED));
        // let result_red = vector::empty<u8>();
        // while(vector::length(&result_red) < 7) {
        //     let red = randomness::u8_range(1,34);
        //     if (!vector::contains(&result_red, &red)) {
        //         vector::push_back(&mut result_red, red);
        //     }
        // };
        // let blue = randomness::u64_range(1,17);
        //
        // if (!exists<LotteryResults>(address_of(sender))) {
        //     let lotteryResults = LotteryResults {
        //         history: vector::empty(),
        //     };
        //
        //     move_to(sender, lotteryResults);
        // };
        // let lotteryResults = borrow_global_mut<LotteryResults>(address_of(sender));
        // let lotteryResult = LotteryResult {
        //     red: result_red,
        //     blue,
        //     timestamp: timestamp::now_microseconds()
        // };
        // let length = vector::length(&lotteryResults.history);
        // vector::insert(&mut lotteryResults.history, length, lotteryResult);
        // print(&result_red);
        // print(&blue);
    }
}
