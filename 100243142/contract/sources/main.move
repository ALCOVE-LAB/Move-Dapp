module myaddr::mynft{
    use std::option;
    use std::signer;
    use std::string;
    use std::string::{String};
    use aptos_std::string_utils;
    use aptos_framework::account;
    use aptos_framework::account::SignerCapability;
    use aptos_framework::event;
    use aptos_framework::object;
    use aptos_framework::object::{Object, ConstructorRef};
   //extra import needed
    use aptos_token_objects::collection;
    use aptos_token_objects::royalty;
    use aptos_token_objects::token;
    use aptos_token_objects::token::{Token, ConcurrentTokenIdentifiers};
    use std::debug::print;
    use std::error;
    use std::vector;
    use aptos_framework::aggregator_v2;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::coin;
    use aptos_framework::coin::Coin;
    use aptos_token_objects::collection::Collection;


    const ResAccountSeed:vector<u8> =b"23ddfas";
    const CDes:vector<u8> =b"there are many cats";
    const CName:vector<u8> =b"cat";
    const MaxSupple : u64 = 2000;
    const CUrl :vector<u8> =b"https://www.google.com/getPic/";
    const TokenUrl :vector<u8> = b"https://ipfs.bluemove.io/uploads/aptos-plainum-gen-0/images/";


    struct ResRef has  key{
        cap : SignerCapability
    }

    struct CRef has key{
        mutator_ref: collection::MutatorRef
    }

    struct TokenRef has key{
        mutator_ref: token::MutatorRef,
        ex_ref:  object::ExtendRef,
        trans_ref:  object::TransferRef,
        burn_ref :token::BurnRef
    }

    struct Content has key{
        content : String
    }

    #[event]
    struct MintEvent has drop, store {
        owner: address,
        token_id: address,
        content: string::String
    }

    #[event]
    struct BurnEvent has drop, store {
        owner: address,
        token_id: address,
        content: string::String
    }

    #[event]
    struct ChangeContentEvent has drop,store{
        owner: address,
        token_id: address,
        content: string::String,
        new_content:String
    }

    struct MyStore has key{
        tokens:vector<address>
    }



    fun init_module(caller:&signer){
        // print(&string::utf8(b"hello"));
        let (res_signer, res_signer_cap) = account::create_resource_account(caller,ResAccountSeed);
        move_to(&res_signer,ResRef{cap:res_signer_cap});


        //   creator: &signer,
        // description: String,
        // max_supply: u64,
        // name: String,
        // royalty: Option<Royalty>,
        // uri: String,
        let royalty = royalty::create(2, 100, signer::address_of(caller));
        let c_ref = collection::create_fixed_collection(&res_signer,string::utf8(CDes),MaxSupple,string::utf8(CName),option::some(royalty),string::utf8(CUrl));
        let c_signer =  object::generate_signer(&c_ref);
        let mutator_ref = collection::generate_mutator_ref(&c_ref);

        let my_store = MyStore{
            tokens: vector::empty<address>()
        };

        move_to(caller,my_store);


        move_to(&c_signer,CRef{mutator_ref:mutator_ref})






        
    }



    // public entry fun mint_for_web(caller :&signer,content:String,ipfs_hash:String)
    // acquires ResRef, MyStore {
    //     create_nft(caller,content,ipfs_hash)
    // }

    public entry fun mint_cat(caller :&signer,content:String)
    acquires ResRef, MyStore {
        create_nft(caller,content,string::utf8(b""))
    }



     fun create_nft(caller :&signer,content:String,ipfs_hash:String
     )
     acquires ResRef, MyStore {
        // different from  create_resource_account(caller,ResAccountSeed);



        //  The name is created by concatenating the (name_prefix, index, name_suffix).
        //  creator: &signer,
        // collection_name: String,
        // description: String,
        // name_with_index_prefix: String,
        // name_with_index_suffix: String,
        // royalty: Option<Royalty>,
        // uri: String,

        let token_cref =  create(caller,string::utf8(CName),string::utf8(CDes),string::utf8(b""));
        print(&object::object_from_constructor_ref<Token>(&token_cref));

        let id  = token::index<Token>(object::object_from_constructor_ref(&token_cref));



        let token_signer = object::generate_signer(&token_cref);

        let token_mutator_ref = token::generate_mutator_ref(&token_cref);
        
        let url = string::utf8(TokenUrl);
        string::append(&mut url,string_utils::to_string(&id));
        string::append_utf8(&mut url,(b".png"));
        token::set_uri(&token_mutator_ref,url);

        let exten_ref = object::generate_extend_ref(&token_cref);
        let mut_ref = token::generate_mutator_ref(&token_cref);
        let burn_ref = token::generate_burn_ref(&token_cref);
        let trans_ref = object::generate_transfer_ref(&token_cref);




        move_to(&token_signer,TokenRef{ex_ref:exten_ref,mutator_ref:mut_ref,burn_ref:burn_ref,trans_ref:trans_ref});

        move_to(
            &token_signer,
            Content {
                content
            }
        );

        event::emit(
            MintEvent{
                owner:signer::address_of(caller),
                token_id: object::address_from_constructor_ref(&token_cref),
                content
            }
            );

        object::transfer(
            //????
            & account::create_signer_with_capability(&borrow_global<ResRef>( account::create_resource_address(&@myaddr,ResAccountSeed)).cap),
            object::object_from_constructor_ref<Token>(&token_cref),
            signer::address_of(caller)
            );

        // object::object_from_constructor_ref<Token>(&token_cref)

    }

    fun create(caller:&signer,c_name:String,c_des:String,uri:String) :ConstructorRef acquires ResRef, MyStore {
        let res_cap = &borrow_global<ResRef>( account::create_resource_address(&@myaddr,ResAccountSeed)).cap;


        let res_signer = account::create_signer_with_capability(
            res_cap
        );
       let token = token::create_numbered_token(
            &res_signer,string::utf8(CName),string::utf8(CDes),
            string::utf8(b"start"),string::utf8(b"end"),
            option::none(), string::utf8(b""));
        let my_store_tokens = &mut borrow_global_mut<MyStore>( @myaddr).tokens;
        vector::push_back( my_store_tokens, object::address_from_constructor_ref(&token));
        token

    }

    public entry fun burn(caller :&signer,addr:address) acquires Content,TokenRef{
        assert!(
            object::is_object(addr) 
            ,1
        );

        exists<Content>(addr);

        let obj = object::address_to_object<Content>(addr);
        assert!(object::is_owner(object::address_to_object<Content>(addr),signer::address_of(caller)),3);
        

        let TokenRef{
            ex_ref:_,
            mutator_ref:_,
            burn_ref,
            trans_ref:_

        } =  move_from<TokenRef>(object::object_address(&obj));

        let Content{
            content
        } = move_from<Content>(object::object_address(&obj));

        event::emit(BurnEvent{
            owner:signer::address_of(caller),
            token_id:addr,
            content
        });

        token::burn(burn_ref);

    }

    public entry fun change_content(caller:&signer,obj:Object<Content>,edit_content: String) acquires Content{

        let c = borrow_global_mut<Content>(object::object_address(&obj));

        let old_content = c.content;
        c.content = edit_content;

        event::emit(ChangeContentEvent{
           owner:signer::address_of(caller),
           token_id:object::object_address(&obj),
           content:old_content,
           new_content:edit_content
        });
    }

    // fun get_name(token:&Token):String{
    //     token.name
    // }







    #[view]
    public fun get_content(obj:Object<Content>): String
    acquires Content {
         borrow_global<Content>(object::object_address(&obj)).content

    }

    #[view]
    public fun get_token_name(obj:Object<Content>):String
     {
        // let mutator_ref =  borrow_global<TokenRef>(object::object_address(&obj)).mutator_ref;
        token::name(obj)
    }

    #[view]
    public fun get_all_tokens():vector<address> acquires MyStore {
        let my_store_tokens =  borrow_global_mut<MyStore>( @myaddr).tokens;
        my_store_tokens
    }

    struct TokenRes{
        name :String,
        url :String,
        collection_name: String,
        collection_id: address,
        token_id:address
    }

    #[view]
    public fun get_token_info(obj:Object<Token>):TokenRes{
        let tRes = TokenRes{
            name:token::name(obj),
            url:token::uri(obj),
            collection_name:token::collection_name(obj),
            collection_id:object::object_address<Collection>(&token::collection_object(obj) ),
            token_id:object::object_address(&obj)
        };
        tRes
    }

    #[view]
    public fun get_tokens_infos(objs:vector<address>):vector<TokenRes>{



        let res :vector<TokenRes> = vector::empty<TokenRes>();
        while(!vector::is_empty<address>(&objs)){



            let obj_addr  = vector::pop_back<address>(&mut objs);

            let obj = object::address_to_object<Token>(obj_addr);

            let tRes = TokenRes{
                name:token::name(obj),
                url:token::uri(obj),
                collection_name:token::collection_name(obj),
                collection_id:object::object_address<Collection>(&token::collection_object(obj) ),
                token_id: obj_addr

            };
            vector::push_back<TokenRes>(&mut res,tRes);

        };

        res
    }

    // #[view]
    // public fun get_content2(creator: address, collection: String, name: String):String  {
    //     let token_addr = token::create_token_address(&creator,&collection,&name);
    //     // let token = object::address_to_object<Token>(token_addr);
    //     // token::name(token)
    //     let Content{content } = move_from<Content>(token_addr);
    //     content
    // }



    //
    // struct TestStruct<T:key> has key,store {
    //     value: T
    // }
    //
    // inline  fun  m_borrow_global_mut<phantom T>(caller: &signer,obj:object::Object<T>) : &mut T acquires TestStruct{
    //
    //     assert!(object::is_owner(obj,signer::address_of(caller)),1);
    //     &mut borrow_global_mut<TestStruct<T>>(object::object_address<T>(&obj)).value
    //
    // }
    //
    // inline  fun  m_borrow_global<phantom T>(caller: &signer,obj:object::Object<T>) :  &T  acquires TestStruct  {
    //
    //     assert!(object::is_owner(obj,signer::address_of(caller)),1);
    //     &borrow_global<TestStruct<T>>(object::object_address<T>(&obj)).value
    //
    // }

    #[test_only]
    public fun init_for_test(sender: &signer) {
        init_module(sender)
    }

    // #[test(sender = @myaddr)]
    // public fun init_for_test2(sender:&signer) acquires ResRef  {
    //     // init_module(sender);
    //     mint_Cat(sender,string::utf8(b"3343"));
    //     // print(&obj);
    //     // print(&string::utf8(b"hello"));


    // }


}