module oneclicknft::oneclicknft {
    use std::option;
    use std::signer;
    use std::string;
    use std::string::String;
    use aptos_std::string_utils;
    use aptos_framework::account;
    use aptos_framework::account::SignerCapability;
    use aptos_framework::event;
    use aptos_framework::object;
    use aptos_framework::object::Object;

    use aptos_token_objects::collection;
    use aptos_token_objects::royalty;
    use aptos_token_objects::token;
    use aptos_token_objects::token::Token;

    // ERROR CODE
    const ERROR_NOWNER: u64 = 1;

    const ResourceAccountSeed: vector<u8> = b"Rembrandt";

    const CollectionDescription: vector<u8> = b"cute girl";

    const CollectionName: vector<u8> = b"cute";

    const CollectionURI: vector<u8> = b"https://pbs.twimg.com/media/GHkuGnIbsAAQOJD?format=jpg";

    const TokenURI: vector<u8> = b"https://pbs.twimg.com/media/GHkuGnIbsAAQOJD?format=jpg";

    const TokenPrefix: vector<u8> = b"Girl #";

    struct ResourceCap has key {
        cap: SignerCapability
    }

    struct CollectionRefsStore has key {
        mutator_ref: collection::MutatorRef
    }

    struct TokenRefsStore has key {
        mutator_ref: token::MutatorRef,
        burn_ref: token::BurnRef,
        extend_ref: object::ExtendRef,
        transfer_ref: option::Option<object::TransferRef>
    }

    struct Content has key,store,drop {
        name: string::String,
        link: string::String,
        description:string::String
    }

    #[event]
    struct MintEvent has drop, store {
        owner: address,
        token_id: address,
        content: Content
    }

    #[event]
    struct SetContentEvent has drop, store {
        owner: address,
        token_id: address,
        old_content: Content,
        new_content: Content
    }

    #[event]
    struct BurnEvent has drop, store {
        owner: address,
        token_id: address,
        content: Content
    }


    fun init_module(sender: &signer) {
        let (resource_signer, resource_cap) = account::create_resource_account(
            sender,
            ResourceAccountSeed
        );

        move_to(
            &resource_signer,
            ResourceCap {
                cap: resource_cap
            }
        );

        let collection_cref = collection::create_unlimited_collection(
            &resource_signer,
            string::utf8(CollectionDescription),
            string::utf8(CollectionName),
            option::some(royalty::create(5, 100, signer::address_of(sender))),
            string::utf8(CollectionURI)
        );

        let collection_signer = object::generate_signer(&collection_cref);

        let mutator_ref = collection::generate_mutator_ref(&collection_cref);

        move_to(
            &collection_signer,
            CollectionRefsStore {
                mutator_ref
            }
        );
    }


    entry public fun mint(sender: &signer, name:string::String,description: string::String,url:string::String) acquires ResourceCap {
        let resource_cap = &borrow_global<ResourceCap>(account::create_resource_address(&@oneclicknft, ResourceAccountSeed)).cap;

        let resource_signer = &account::create_signer_with_capability(
            resource_cap
        );
        let token_cref = token::create_numbered_token(
            resource_signer,
            string::utf8(CollectionName),
            description,
            name,
            string::utf8(b""),
            option::none(),
            string::utf8(b""),
        );

        let token_signer = object::generate_signer(&token_cref);

        // create token_mutator_ref
        let token_mutator_ref = token::generate_mutator_ref(&token_cref);

        token::set_uri(&token_mutator_ref, url);

        // token::set_description(&token_mutator_ref,string::utf8(b"hello change") );

        // create generate_burn_ref
        let token_burn_ref = token::generate_burn_ref(&token_cref);

        // if you want stop transfer ( must save transfer_ref
        // let transfer_ref = object::generate_transfer_ref(&token_cref);
        // object::disable_ungated_transfer(&transfer_ref);

        move_to(
            &token_signer,
            TokenRefsStore {
                mutator_ref: token_mutator_ref,
                burn_ref: token_burn_ref,
                extend_ref: object::generate_extend_ref(&token_cref),
                transfer_ref: option::none()
            }
        );

        move_to(
            &token_signer,
            Content {
                name,
                link:url,
                description
            }
        );


        event::emit(
            MintEvent {
                owner: signer::address_of(sender),
                token_id: object::address_from_constructor_ref(&token_cref),
                content:Content{
                    name,
                    link:url,
                    description
                }
            }
        );

        object::transfer(
            resource_signer,
            object::object_from_constructor_ref<Token>(&token_cref),
            signer::address_of(sender),
        )
    }


    entry fun burn(sender: &signer, object: Object<Content>) acquires TokenRefsStore, Content {
        assert!(object::is_owner(object, signer::address_of(sender)), ERROR_NOWNER);
        let TokenRefsStore {
            mutator_ref: _,
            burn_ref,
            extend_ref: _,
            transfer_ref: _
        } = move_from<TokenRefsStore>(object::object_address(&object));

        let content = move_from<Content>(object::object_address(&object));

        event::emit(
            BurnEvent {
                owner: object::owner(object),
                token_id: object::object_address(&object),
                content
            }
        );

        token::burn(burn_ref);
    }


    #[view]
    public fun get_content(object: Object<Content>): Content acquires Content {
        let Content{name,link,description}=borrow_global<Content>(object::object_address(&object));
        Content{name:*name,link:*link,description:*description}
    }

    inline fun borrow_content(owner: address, object: Object<Content>): &Content {
        assert!(object::is_owner(object, owner), ERROR_NOWNER);
        borrow_global<Content>(object::object_address(&object))
    }

    inline fun borrow_mut_content(owner: address, object: Object<Content>): &mut Content {
        assert!(object::is_owner(object, owner), ERROR_NOWNER);
        borrow_global_mut<Content>(object::object_address(&object))
    }

    #[test_only]
    public fun init_for_test(sender: &signer) {
        init_module(sender)
    }
}


