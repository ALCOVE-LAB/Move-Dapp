module dapp::dapp{
    use std::debug;
    use std::signer;
    use std::coin;

    use aptos_framework::account;
    use std::string;
    use std::string::{String,utf8};
    use std::option;
    use aptos_token_objects::token;
    use aptos_framework::fungible_asset::{BurnRef, TransferRef};
    use aptos_token_objects::collection::MutatorRef;
    use aptos_token_objects::collection;
    use aptos_token_objects::aptos_token::{Self,AptosToken};
    use aptos_framework::event;
    use aptos_framework::object::{Self,Object, LinearTransferRef,DeleteRef};
    use aptos_token_objects::token::Token;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::account::SignerCapability;

    const Fixed_price:u64 = 10000000;
    const Mycollection:vector<u8> =b"mycollection";
    struct CollectionRefsStore has key{

        mutator_ref:collection::MutatorRef,

    }
    #[event]
    struct Collection has store,key,drop {
        owner:address,
        token_id:address,

    }
    struct Resoucecap has key{
        cap:SignerCapability
    }
    struct Tokenstore has key{
        mutator_ref: token::MutatorRef,
        burn_ref: token::BurnRef,
        transfer_ref: option::Option<object::TransferRef>
    }
    #[event]
    struct BurnEvent has drop, store {
        owner: address,
        token_id: address,

    }
    fun money(caller : &signer){
        let pay = coin::withdraw<AptosCoin>(caller,Fixed_price);
        coin::deposit(@dapp,pay);

    }
    fun init_module (caller:&signer){
        let (resource_signer, resource_cap) = account::create_resource_account(
            caller,
            Mycollection
        );
        move_to(&resource_signer,Resoucecap{cap:resource_cap});

        let des:String=utf8(b"your_collection");
        let name :String =utf8(b"your_own_collection");
        let url :String=utf8(b"https://image-mys.4everland.store/IMG_0662.JPG");
        let collection =  collection::create_unlimited_collection(
            &resource_signer,
            des,
            name,
            option::none(),
            url
        );
        let collection_signer=object::generate_signer( &collection);

        let mutator_ref = aptos_token_objects::collection::generate_mutator_ref(&collection);
        move_to(&collection_signer,
            CollectionRefsStore{
                mutator_ref});
    }
    entry public fun withdraw_balance(caller : &signer){
        //assert!()
    }
    entry public fun mint_unlimited_collection(){

    }

    entry public fun mint_single_collection(caller : &signer , url : string::String) acquires  Resoucecap {
        let des:String=utf8(b"your_collection");
        let name :String =utf8(b"your_own_collection");
        let resource_cap = &borrow_global<Resoucecap>(aptos_framework::account::create_resource_address(&@dapp,Mycollection)).cap;
        let resource_signer = &account::create_signer_with_capability(resource_cap);
            money(caller);
        let token = token::create(resource_signer ,name,des,utf8(b"own_nft"),option::none(),url);
        let token_signer = object::generate_signer(&token);
        let token_mutator_ref = token::generate_mutator_ref(&token);
        let token_burn_ref =token::generate_burn_ref(&token);
        //move_to(&collection_signer,CollectionRefsStore{mutator_ref});
        move_to(
            &token_signer,
            Tokenstore {
                mutator_ref: token_mutator_ref,
                burn_ref: token_burn_ref,
                transfer_ref: option::none()
            }
        );
        object::transfer(
            resource_signer,
            object::object_from_constructor_ref<Token>(&token ),
            signer::address_of(caller)
        );
        // event::emit(
        //     Collection{
        //         owner:signer::address_of(caller),
        //         token_id:object::address_from_constructor_ref(&collection),
        //         }
        // );
        // move_to(caller, Collection{
        //     owner:signer::address_of(caller),
        //     token_id:object::address_from_constructor_ref(&collection),
        // });




    }
    // entry public fun burn_object(caller :&signer,object:Object<CollectionRefsStore> )acquires CollectionRefsStore{
    //     assert!(object::is_owner(object,signer::address_of(caller)),1);
    //     let CollectionRefsStore{
    //         mutator_ref:_,
    //         deleteRef
    //     } = move_from<CollectionRefsStore>(signer::address_of(caller));
    //     event::emit(
    //         BurnEvent {
    //             owner: object::owner(object),
    //             token_id: object::object_address(&object),
    //
    //         }
    //     );
    //     object::delete(deleteRef);
    //
    // }

    entry public fun burn_token(caller :&signer,object:Object<Tokenstore> )acquires Tokenstore{
        assert!(object::is_owner(object,signer::address_of(caller)),1);
        let Tokenstore{
            mutator_ref: _,
            burn_ref,
            transfer_ref: _
        } = move_from<Tokenstore>(object::object_address(&object));
        event::emit(
            BurnEvent {
                owner: object::owner(object),
                token_id: object::object_address(&object),

            }
        );
        token::burn(burn_ref);

    }
    // entry public fun transfer(sender : &signer , receiver :address , object:Object){
    //    let sender_address =signer::address_of(sender);
    //     //let object_address = object::object_address(object);
    //
    //
    //     object::transfer(
    //         sender_address,
    //         object_address,
    //         receiver,
    //     );
    // }


    #[test_only]
    public fun  test(caller:&signer) acquires  Resoucecap {
        let a :String= utf8(b"https://pot-124.4everland.store/IMG_0714.JPG");
         mint_single_collection(caller,a);

    }
    #[test_only]
    public fun init_for_test(sender: &signer) {
        init_module(sender)
    }
    inline fun borrow_content(owner: address, object: Object<Tokenstore>): &Tokenstore {
        assert!(object::is_owner(object, owner), 1);
        borrow_global<Tokenstore>(object::object_address(&object))
    }
    inline fun borrow_mut_content(owner: address, object: Object<Tokenstore>): &mut Tokenstore {
        assert!(object::is_owner(object, owner), 1);
        borrow_global_mut<Tokenstore>(object::object_address(&object))
    }
}
