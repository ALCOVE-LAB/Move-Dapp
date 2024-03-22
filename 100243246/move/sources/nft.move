module admin::nft {

    //==============================================================================================
    // Dependencies
    //==============================================================================================

    use aptos_framework::account::{Self, SignerCapability};
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use aptos_token_objects::token;
    use aptos_token_objects::collection;
    use aptos_framework::event;
    use aptos_framework::option;
    use std::string_utils;
    use std::object::{Self, Object};
    use aptos_framework::timestamp;
    use std::debug;

    //==============================================================================================
    // Errors
    //==============================================================================================

    const ERROR_SIGNER_NOT_ADMIN: u64 = 0;
    const ERROR_SIGNER_NOT_OWNER: u64 = 1;
    const ERROR_SONG_DUPLICATED: u64 = 2;
    const ERROR_OTHERS: u64 = 3;

    //==============================================================================================
    // Constants
    //==============================================================================================

    // Seed for resource account creation
    const SEED: vector<u8> = b"nft";


    // NFT collection information
    const COLLECTION_NAME: vector<u8> = b"TS Songs";
    const COLLECTION_DESCRIPTION: vector<u8> = b"Collection of names of TS songs";
    const COLLECTION_URI: vector<u8> = b"ipfs://bafybeig75h47mwnmw5k6zlkytn5nobp7au3f4d7upuardlwyz4rczjn6ia";
    const TOKEN_URI: vector<u8> = b"ipfs://bafybeibuossuwyql2ezgi2hr7vjwihfta5dvzj556i54v6zmq3rwfw7mxy";

    //==============================================================================================
    // Module Structs
    //==============================================================================================

    struct Token_Ref has store, key {
        // Used for editing the token data
        mutator_ref: token::MutatorRef,
        // Used for burning the token
        burn_ref: token::BurnRef,
    }

    struct Song has store, key {
        song_name: String
    }

    /*
    Information to be used in the module
*/
    struct State has key {
        // signer cap of the module's resource account
        signer_cap: SignerCapability,
        songs: vector<String>,
        // Events
        token_minted_events: u64,
        name_changed_events: u64,
        token_burned_events: u64,
    }

    //==============================================================================================
    // Event structs
    //==============================================================================================
    #[event]
    struct TokenMintedEvent has store, drop {
        // user
        user: address,
        // nft object address
        nft: address,
        song_name: String,
        // timestamp
        timestamp: u64
    }

    #[event]
    struct TokenMintedEvent_V2 has store, drop {
        // user
        user: address,
        // nft object address
        nft: address,
        nft_uri: String,
        song_name: String,
        // timestamp
        timestamp: u64
    }

    #[event]
    struct NameChangedEvent has store, drop {
        // user
        user: address,
        // nft object address
        nft: address,
        old_name: String,
        new_name: String,
        // timestamp
        timestamp: u64
    }

    #[event]
    struct TokenBurnedEvent has store, drop {
        // user
        user: address,
        // nft object address
        nft: address,
        song_name: String,
        // timestamp
        timestamp: u64
    }

    //==============================================================================================
    // Functions
    //==============================================================================================

    fun init_module(admin: &signer) {
        assert_admin(signer::address_of(admin));
        let (resource_signer, resource_cap) = account::create_resource_account(admin, SEED);

        // Create an NFT collection with an unlimited supply and the following aspects:
        collection::create_unlimited_collection(
            &resource_signer,
            string::utf8(COLLECTION_DESCRIPTION),
            string::utf8(COLLECTION_NAME),
            option::none(),
            string::utf8(COLLECTION_URI)
        );

        // Create the State global resource and move it to the admin account
        let state = State{
            signer_cap: resource_cap,
            songs: vector::empty(),
            token_minted_events: 0,
            name_changed_events: 0,
            token_burned_events: 0,
        };
        move_to<State>(admin, state);
    }
    public entry fun mint_nft(user: &signer, song: String) acquires State {
        let user_add = signer::address_of(user);
        let state = borrow_global_mut<State>(@admin);
        assert_song_not_duplicated(state.songs, song);
        let res_signer = account::create_signer_with_capability(&state.signer_cap);
        let token_name = string_utils::format1(&b"Song #{}", state.token_minted_events);
        let token_uri = string::utf8(TOKEN_URI);
        string::append(&mut token_uri, string_utils::format1(&b"/{}.png", state.token_minted_events - (state.token_minted_events/10)*10 + 1));
        // Create a new named token:
        let token_const_ref = token::create_named_token(
            &res_signer,
            string::utf8(COLLECTION_NAME),
            song,
            token_name,
            option::none(),
            token_uri
        );
        debug::print(&token_uri);
        let obj_signer = object::generate_signer(&token_const_ref);
        let obj_add = object::address_from_constructor_ref(&token_const_ref);
        object::transfer_raw(&res_signer, obj_add, user_add);

        let new_nft_token_ref = Token_Ref {
            mutator_ref: token::generate_mutator_ref(&token_const_ref),
            burn_ref: token::generate_burn_ref(&token_const_ref)
        };
        move_to<Token_Ref>(&obj_signer, new_nft_token_ref);

        let new_song = Song {
            song_name: song
        };
        move_to<Song>(&obj_signer, new_song);

        vector::push_back(&mut state.songs, song);

        event::emit(TokenMintedEvent_V2 {
            user: user_add,
            nft: obj_add,
            nft_uri: token_uri,
            song_name: song,
            timestamp: timestamp::now_seconds()
        });
        state.token_minted_events = state.token_minted_events + 1;
    }

    public entry fun edit_song_name(user: &signer, obj_add: address, new_name: String) acquires State, Song, Token_Ref {
        let user_add = signer::address_of(user);
        assert_owner(user_add, object::address_to_object<Song>(obj_add));
        let old_name = borrow_global<Song>(obj_add).song_name;
        borrow_global_mut<Song>(obj_add).song_name = new_name;
        let token_ref = borrow_global<Token_Ref>(obj_add);
        token::set_description(&token_ref.mutator_ref,new_name);
        let state = borrow_global_mut<State>(@admin);
        let (_found, i) = vector::index_of(&state.songs, &old_name);
        vector::remove(&mut state.songs, i);
        vector::push_back(&mut state.songs, new_name);

        event::emit(NameChangedEvent {
            user: user_add,
            nft: obj_add,
            old_name,
            new_name,
            timestamp: timestamp::now_seconds()
        });
        state.name_changed_events = state.name_changed_events + 1;
    }

    public entry fun burn_nft(user: &signer, obj_add: address) acquires State, Song, Token_Ref {
        let user_add = signer::address_of(user);
        assert_owner(user_add, object::address_to_object<Song>(obj_add));
        let Token_Ref{mutator_ref: _, burn_ref} = move_from<Token_Ref>(obj_add);
        let Song{song_name} = move_from<Song>(obj_add);
        let state = borrow_global_mut<State>(@admin);
        let (_found, i) = vector::index_of(&state.songs, &song_name);
        vector::remove(&mut state.songs, i);
        // Burn the the token
        token::burn(burn_ref);
        event::emit(TokenBurnedEvent {
            user: user_add,
            nft: obj_add,
            song_name,
            timestamp: timestamp::now_seconds()
        });
        state.token_burned_events = state.token_burned_events + 1;
    }

    //==============================================================================================
    // Validation functions
    //==============================================================================================

    inline fun assert_admin(admin: address) {
        assert!(admin == @admin, ERROR_SIGNER_NOT_ADMIN);
    }

    inline fun assert_owner(user: address, nft: Object<Song>) {
        assert!(object::is_owner(nft, user), ERROR_SIGNER_NOT_OWNER);
    }

    inline fun assert_song_not_duplicated(songs: vector<String>, song: String) {
        assert!(!vector::contains(&songs, &song), ERROR_SONG_DUPLICATED)
    }

    //==============================================================================================
    // View functions
    //==============================================================================================

    #[view]
    public fun check_if_song_name_exists(song: String): bool acquires State {
        let state = borrow_global<State>(@admin);
        vector::contains(&state.songs, &song)
    }

    //==============================================================================================
    // Test functions
    //==============================================================================================


    #[test(admin = @admin)]
    fun test_init_module_success(
        admin: &signer
    ) acquires State {
        let admin_address = signer::address_of(admin);
        account::create_account_for_test(admin_address);

        let aptos_framework = account::create_account_for_test(@aptos_framework);
        timestamp::set_time_has_started_for_testing(&aptos_framework);

        init_module(admin);

        let expected_resource_account_address = account::create_resource_address(&admin_address, SEED);
        assert!(account::exists_at(expected_resource_account_address), 0);

        let state = borrow_global<State>(admin_address);
        assert!(
            account::get_signer_capability_address(&state.signer_cap) == expected_resource_account_address,
            0
        );

        let expected_collection_address = collection::create_collection_address(
            &expected_resource_account_address,
            &string::utf8(COLLECTION_NAME)
        );
        let collection_object = object::address_to_object<collection::Collection>(expected_collection_address);
        assert!(
            collection::creator<collection::Collection>(collection_object) == expected_resource_account_address,
            3
        );
        assert!(
            collection::name<collection::Collection>(collection_object) == string::utf8(COLLECTION_NAME),
            3
        );
        assert!(
            collection::description<collection::Collection>(collection_object) == string::utf8(COLLECTION_DESCRIPTION),
            3
        );
        assert!(
            collection::uri<collection::Collection>(collection_object) == string::utf8(COLLECTION_URI),
            3
        );

        assert!(state.token_minted_events == 0, 3);
    }

    #[test(admin = @admin, user = @0xA)]
    fun test_mint_success(
        admin: &signer,
        user: &signer,
    ) acquires State {
        let admin_address = signer::address_of(admin);
        let user_address = signer::address_of(user);

        let aptos_framework = account::create_account_for_test(@aptos_framework);
        timestamp::set_time_has_started_for_testing(&aptos_framework);
        init_module(admin);

        let resource_account_address = account::create_resource_address(&@admin, SEED);

        let song = string::utf8(b"Fearless");
        mint_nft(user, song);

        let state = borrow_global<State>(admin_address);

        let expected_nft_token_address = token::create_token_address(
            &resource_account_address,
            &string::utf8(COLLECTION_NAME),
            &string_utils::format1(&b"Song #{}", 0)
        );
        let nft_token_object = object::address_to_object<token::Token>(expected_nft_token_address);
        assert!(
            object::is_owner(nft_token_object, user_address) == true,
            1
        );
        assert!(
            token::creator(nft_token_object) == resource_account_address,
            3
        );
        assert!(
            token::name(nft_token_object) == string_utils::format1(&b"Song #{}", 0),
            3
        );
        assert!(
            token::description(nft_token_object) == song,
            3
        );

        assert!(state.token_minted_events == 1, 3);
    }

    #[test(admin = @admin, user = @0xA)]
    fun test_name_change_success(
        admin: &signer,
        user: &signer,
    ) acquires State, Song, Token_Ref {
        let admin_address = signer::address_of(admin);
        let user_address = signer::address_of(user);

        let aptos_framework = account::create_account_for_test(@aptos_framework);
        timestamp::set_time_has_started_for_testing(&aptos_framework);
        init_module(admin);

        let resource_account_address = account::create_resource_address(&@admin, SEED);

        let old_song = string::utf8(b"Fearless");
        mint_nft(user, old_song);
        let expected_nft_token_address = token::create_token_address(
            &resource_account_address,
            &string::utf8(COLLECTION_NAME),
            &string_utils::format1(&b"Song #{}", 0)
        );
        let new_song = string::utf8(b"Fearless (TV)");
        edit_song_name(user, expected_nft_token_address, new_song);
        let state = borrow_global<State>(admin_address);

        let nft_token_object = object::address_to_object<token::Token>(expected_nft_token_address);
        assert!(
            object::is_owner(nft_token_object, user_address) == true,
            1
        );
        assert!(
            token::creator(nft_token_object) == resource_account_address,
            3
        );
        assert!(
            token::name(nft_token_object) == string_utils::format1(&b"Song #{}", 0),
            3
        );
        assert!(
            token::description(nft_token_object) == new_song,
            3
        );
        assert!(
            borrow_global<Song>(expected_nft_token_address).song_name == new_song,
            3
        );

        assert!(state.token_minted_events == 1, 3);
        assert!(state.name_changed_events == 1, 3);
    }

    #[test(admin = @admin, user = @0xA)]
    fun test_burn_success(
        admin: &signer,
        user: &signer,
    ) acquires State, Song, Token_Ref {
        let admin_address = signer::address_of(admin);

        let aptos_framework = account::create_account_for_test(@aptos_framework);
        timestamp::set_time_has_started_for_testing(&aptos_framework);
        init_module(admin);

        let resource_account_address = account::create_resource_address(&@admin, SEED);

        let song = string::utf8(b"Fearless");
        mint_nft(user, song);
        let expected_nft_token_address = token::create_token_address(
            &resource_account_address,
            &string::utf8(COLLECTION_NAME),
            &string_utils::format1(&b"Song #{}", 0)
        );
        burn_nft(user, expected_nft_token_address);
        let state = borrow_global<State>(admin_address);
        assert!(
            !exists<Song>(expected_nft_token_address),
            3
        );
        assert!(
            !exists<Token_Ref>(expected_nft_token_address),
            3
        );

        assert!(state.token_minted_events == 1, 3);
        assert!(state.token_burned_events == 1, 3);
    }

}
