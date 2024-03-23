module birds_nft::birds_nft {
    use std::option;
    use std::signer;
    use std::string;
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

    const ResourceAccountSeed: vector<u8> = b"birds";

    const CollectionDescription: vector<u8> = b"birds test.";

    const CollectionName: vector<u8> = b"birds";

    const CollectionURI: vector<u8> = b"ipfs://QmWmgfYhDWjzVheQyV2TnpVXYnKR25oLWCB2i9JeBxsJbz";

    const TokenURI: vector<u8> = b"ipfs://bafybeiearr64ic2e7z5ypgdpu2waasqdrslhzjjm65hrsui2scqanau3ya/";

    const TokenPrefix: vector<u8> = b"birds #";

    const InftImage:vector<u8> = b"https://bafkreic5c4t6clrpb2zetcotjfb5bbkt5vd5ijcogpdy7w3uwf7qy4lq34.ipfs.nftstorage.link/";

    struct ResourceCap has key {
        cap: SignerCapability
    }

    struct CollectionRefsStore has key {
        mutator_ref: collection::MutatorRef
    }

    // struct Content has key {
    //     content: string::String
    // }

     struct NewBirdContent has key {
        content: string::String,
        buysigner: address,
        nftaddress: string::String
    }

    struct InftJson has key,store,drop{
        size:vector<u16>,
        cell: vector<u16>,
        grid: vector<u16>,
        type: u8,
        image:vector<u8>
    }

    struct NewBird has key {      
      name:vector<u8>,
      nft_address: address
    }


    #[event]
    struct SetContentEvent has drop, store {
        owner: address,
        token_id: address,
        old_content: string::String,
        new_content: string::String
    } 


    fun init_module(sender: &signer) {

        let  inftJson = InftJson{
            size: vector[360,100],
            cell: vector[50,50],
            grid: vector[8,8],
            type: 2,
            image:InftImage
        }; 

        move_to(sender, inftJson);


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
        content: string::String,
        nftaddress: string::String

    ) acquires ResourceCap {
        let resource_cap = &borrow_global<ResourceCap>(
            account::create_resource_address(
                &@birds_nft,
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

        // let id = token::index<Token>(object::object_from_constructor_ref(&token_cref));
        // string::append(&mut url, string_utils::to_string(&id));
        // string::append(&mut url, string::utf8(b"address.png"));

        // create token_mutator_ref
        let token_mutator_ref = token::generate_mutator_ref(&token_cref);

        token::set_uri(&token_mutator_ref, content);

        let token_signer = object::generate_signer(&token_cref);      

   

        // if you want stop transfer ( must save transfer_ref
        // let transfer_ref = object::generate_transfer_ref(&token_cref);
        // object::disable_ungated_transfer(&transfer_ref);   

        // move_to(
        //     &token_signer,
        //     Content {
        //         content
        //     }
        // );  

        let buysigner = signer::address_of(sender);
        

        move_to(
            &token_signer,
            NewBirdContent {
                content:content,
                buysigner: buysigner,
                nftaddress:nftaddress
            }
        );    


            object::transfer(
            resource_signer,
            object::object_from_constructor_ref<Token>(&token_cref),
            signer::address_of(sender),
        )
    }    

    // entry fun set_content(
    //     sender: &signer,
    //     object: Object<Content>,
    //     content: string::String
    // ) acquires Content {
    //     let old_content = borrow_content(signer::address_of(sender), object).content;
    //     event::emit(
    //         SetContentEvent {
    //             owner: object::owner(object),
    //             token_id: object::object_address(&object),
    //             old_content,
    //             new_content: content
    //         }
    //     );
    //     borrow_mut_content(signer::address_of(sender), object).content = content;
    // }

    // inline fun borrow_content(owner: address, object: Object<Content>): &Content {
    //     assert!(object::is_owner(object, owner), ERROR_NOWNER);
    //     borrow_global<Content>(object::object_address(&object))
    // }

    // inline fun borrow_mut_content(owner: address, object: Object<Content>): &mut Content {
    //     assert!(object::is_owner(object, owner), ERROR_NOWNER);
    //     borrow_global_mut<Content>(object::object_address(&object))
    // }



   
}
