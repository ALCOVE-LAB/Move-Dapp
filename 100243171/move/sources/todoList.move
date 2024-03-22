module Linus::todolist {
    use std::option;
    use std::signer;
    use std::string;
    use std::string:: String;
    use aptos_std::table::{Self, Table}; // This one we already have, need to modify it
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
    const ERROR_NOWNER: u64 = 0;
    const E_NOT_INITIALIZED: u64 = 1;
    const ETASK_DOESNT_EXIST: u64 = 2;
    const ETASK_IS_COMPLETED: u64 = 3;

    const ResourceAccountSeed: vector<u8> = b"todolists";

    const CollectionDescription: vector<u8> = b"When you complete a task, you are given a certificate of completion.";

    const CollectionName: vector<u8> = b"CompletedRewards";

    const CollectionURI: vector<u8> = b"ipfs://QmWmgfYhDWjzVheQyV2TnpVXYnKR25oLWCB2i9JeBxsJbz";

    const TokenURI: vector<u8> = b"ipfs://bafybeiearr64ic2e7z5ypgdpu2waasqdrslhzjjm65hrsui2scqanau3ya/";

    const TokenPrefix: vector<u8> = b"todolist #";

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

    struct Content has key {
        content: string::String
    }

    struct Task has store,drop,copy {
        task_id:u64,
        address:address,
        content:String,
        completed:bool,
    }

    struct TodoList has key {
        tasks: Table<u64, Task>,
        set_task_event: event::EventHandle<Task>,
        task_counter:u64,
    }

    #[event]
    struct MintEvent has drop, store {
        owner: address,
        token_id: address,
        content: string::String
    }

    #[event]
    struct SetContentEvent has drop, store {
        owner: address,
        token_id: address,
        old_content: string::String,
        new_content: string::String
    }

    #[event]
    struct BurnEvent has drop, store {
        owner: address,
        token_id: address,
        content: string::String
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

    entry public fun mint(
        sender: &signer,
        content: string::String
    ) acquires ResourceCap {
        let resource_cap = &borrow_global<ResourceCap>(
            account::create_resource_address(
                &@Linus,
                ResourceAccountSeed
            )
        ).cap;

        let resource_signer = &account::create_signer_with_capability(
            resource_cap
        );
        let url = string::utf8(TokenURI);

        let token_cref = token::create_numbered_token(
            resource_signer,
            string::utf8(CollectionName),
            string::utf8(CollectionDescription),
            string::utf8(TokenPrefix),
            string::utf8(b""),
            option::none(),
            string::utf8(b""),
        );

        let id = token::index<Token>(object::object_from_constructor_ref(&token_cref));
        string::append(&mut url, string_utils::to_string(&id));
        string::append(&mut url, string::utf8(b".png"));

        let token_signer = object::generate_signer(&token_cref);

        // create token_mutator_ref
        let token_mutator_ref = token::generate_mutator_ref(&token_cref);

        token::set_uri(&token_mutator_ref, url);

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
                content
            }
        );

        event::emit(
            MintEvent {
                owner: signer::address_of(sender),
                token_id: object::address_from_constructor_ref(&token_cref),
                content
            }
        );

        object::transfer(
            resource_signer,
            object::object_from_constructor_ref<Token>(&token_cref),
            signer::address_of(sender),
        )
    }


    entry fun burn(
        sender: &signer,
        object: Object<Content>
    ) acquires TokenRefsStore, Content {
        assert!(object::is_owner(object, signer::address_of(sender)), ERROR_NOWNER);
        let TokenRefsStore {
            mutator_ref: _,
            burn_ref,
            extend_ref: _,
            transfer_ref: _
        } = move_from<TokenRefsStore>(object::object_address(&object));

        let Content {
            content
        } = move_from<Content>(object::object_address(&object));

        event::emit(
            BurnEvent {
                owner: object::owner(object),
                token_id: object::object_address(&object),
                content
            }
        );

        token::burn(burn_ref);
    }

    entry fun set_content(
        sender: &signer,
        object: Object<Content>,
        content: string::String
    ) acquires Content {
        let old_content = borrow_content(signer::address_of(sender), object).content;
        event::emit(
            SetContentEvent {
                owner: object::owner(object),
                token_id: object::object_address(&object),
                old_content,
                new_content: content
            }
        );
        borrow_mut_content(signer::address_of(sender), object).content = content;
    }

    #[view]
    public fun get_content(object: Object<Content>): string::String acquires Content {
        borrow_global<Content>(object::object_address(&object)).content
    }

    inline fun borrow_content(owner: address, object: Object<Content>): &Content {
        assert!(object::is_owner(object, owner), ERROR_NOWNER);
        borrow_global<Content>(object::object_address(&object))
    }

    inline fun borrow_mut_content(owner: address, object: Object<Content>): &mut Content {
        assert!(object::is_owner(object, owner), ERROR_NOWNER);
        borrow_global_mut<Content>(object::object_address(&object))
    }

    public entry fun create_list(account: &signer){
        let task_holder = TodoList {
            tasks: table::new(),
            set_task_event: account::new_event_handle<Task>(account),
            task_counter:  0,
        };

        move_to(account, task_holder);
    }

    public entry fun create_task(account: &signer, content: String) acquires TodoList {
        let signer_address = signer::address_of(account);
        assert!(exists<TodoList>(signer_address),E_NOT_INITIALIZED);
        let todo_list = borrow_global_mut<TodoList>(signer_address);
        let counter = todo_list.task_counter + 1;
        let new_task = Task {
            task_id: counter,
            address: signer_address,
            content,
            completed: false
        };
        table::upsert(&mut todo_list.tasks, counter, new_task);
        todo_list.task_counter = counter;
        event::emit_event<Task>(
            &mut todo_list.set_task_event,
            new_task,
        );
    }

    public entry fun complete_task(account:&signer, task_id: u64) acquires TodoList, ResourceCap {
        let signer_address = signer::address_of(account);
        assert!(exists<TodoList>(signer_address),E_NOT_INITIALIZED);
        let todo_list = borrow_global_mut<TodoList>(signer_address);
        assert!(table::contains(&todo_list.tasks, task_id), ETASK_DOESNT_EXIST);
        let task_record = table::borrow_mut(&mut todo_list.tasks, task_id);
        assert!(task_record.completed == false,ETASK_IS_COMPLETED);
        task_record.completed = true;
        mint(account,task_record.content)
    }

    // #[test_only]
    // public fun init_for_test(sender: &signer) {
    //     init_module(sender)
    // }
}