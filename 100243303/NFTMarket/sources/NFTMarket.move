module nftmarket::nftmarket{
    use std::option;
    use std::signer;
    use std::signer::address_of;
    use std::string;
    use aptos_std::string_utils;
    use aptos_std::table;
    use aptos_std::table::Table;
    use aptos_framework::account;
    use aptos_framework::account::SignerCapability;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::coin;
    use aptos_framework::event;
    use aptos_framework::object;
    use aptos_framework::object::{Object};
    use aptos_token_objects::collection;
    use aptos_token_objects::token;
    use aptos_token_objects::token::Token;

    const RESOURCECAPSEED : vector<u8> = b"Gauss";

    const CollectionDescription: vector<u8> = b"gauss nft test";

    const CollectionName: vector<u8> = b"gauss";

    const CollectionURI: vector<u8> = b"ipfs://QmWmgfYhDWjzVheQyV2TnpVXYnKR25oLWCB2i9JeBxsJbz";

    const TokenURI: vector<u8> = b"ipfs://bafybeiearr64ic2e7z5ypgdpu2waasqdrslhzjjm65hrsui2scqanau3ya/";

    const TokenPrefix: vector<u8> = b"Gauss #";

    struct ResourceCap has key {
        cap: SignerCapability
    }

    struct TokenRefsStore has key {
        burn_ref: token::BurnRef
    }

    struct Content has key {
        content: string::String
    }

    struct Orders has key, store {
        orders: Table<u64, Order>,
        order_counter: u64
    }

    #[event]
    struct Order has store, drop, copy {
        orderId: u64,
        seller: address,
        price: u64,
        token: Object<Token>,
        completed: bool
    }

    #[event]
    struct MintEvent has drop, store {
        owner: address,
        token: address,
        content: string::String
    }

    #[event]
    struct ModifyEvent has drop,store {
        owner: address,
        tokenId: address,
        old_content: string::String,
        new_content: string::String
    }

    #[event]
    struct BurnEvent has drop, store {
        owner: address,
        tokenId: address,
        content: string::String
    }

    #[event]
    struct TransferEvent has drop, store {
        buyer: address,
        seller: address,
        price: u64,
        tokenId: address
    }

    #[event]
    struct ChangePrice has drop, store {
        orderId: u64,
        old_price: u64,
        new_price: u64
    }

    #[event]
    struct CancelOrder has drop, store {
        orderId: u64,
        seller: address,
        token: address
    }

    fun init_module(sender: &signer) {

        let (resource_signer, resource_cap) = account::create_resource_account(
            sender, RESOURCECAPSEED
        );

        move_to(&resource_signer, ResourceCap{ cap:resource_cap });

        collection::create_unlimited_collection(
            &resource_signer,
            string::utf8(CollectionDescription),
            string::utf8(CollectionName),
            option::none(),
            string::utf8(CollectionURI)
        );

        let orders = Orders{
            orders: table::new(),
            order_counter: 0
        };

        move_to(sender, orders);

    }

    entry public fun mint(sender: &signer, content: string::String) acquires ResourceCap {

        let resource_cap = &borrow_global<ResourceCap>(account::create_resource_address(
            &@nftmarket, RESOURCECAPSEED
        )).cap;
        let resource_signer = &account::create_signer_with_capability(resource_cap);

        let token_ref = token::create_numbered_token(
            resource_signer,
            string::utf8(CollectionName),
            string::utf8(CollectionDescription),
            string::utf8(TokenPrefix),
            string::utf8(b""),
            option::none(),
            string::utf8(TokenURI),
        );

        //auto set token's picture
        let url = string::utf8(TokenURI);
        let id = token::index<Token>(object::object_from_constructor_ref(&token_ref));
        string::append(&mut url, string_utils::to_string(&id));
        string::append(&mut url, string::utf8(b".png"));
        let token_mutator_ref = token::generate_mutator_ref(&token_ref);
        token::set_uri(&token_mutator_ref, url);

        let token_signer = object::generate_signer(&token_ref);

        move_to(&token_signer, TokenRefsStore{
            burn_ref: token::generate_burn_ref(&token_ref)
        });
        move_to(&token_signer, Content{ content });

        event::emit(
            MintEvent{
                owner: signer::address_of(sender),
                token: object::address_from_constructor_ref(&token_ref),
                content
            }
        );

        object::transfer(
            resource_signer,
            object::object_from_constructor_ref<Token>(&token_ref),
            signer::address_of(sender),
        );

    }

    entry fun modify(sender: &signer, token: Object<Content>, content: string::String) acquires Content {

        assert!(object::is_owner(token, signer::address_of(sender)), 1);

        let old_content = borrow_global<Content>(object::object_address(&token)).content;

        event::emit(
            ModifyEvent{
                owner: object::owner(token),
                tokenId: object::object_address(&token),
                old_content,
                new_content: content
            }
        );

        borrow_global_mut<Content>(object::object_address(&token)).content = content;

    }

    entry fun burn(sender: &signer, token: Object<Content>) acquires TokenRefsStore, Content {

        assert!(object::is_owner(token, signer::address_of(sender)), 1);

        let TokenRefsStore{ burn_ref } = move_from<TokenRefsStore>(object::object_address(&token));
        let Content { content } = move_from<Content>(object::object_address(&token));

        event::emit(
            BurnEvent{
                owner: signer::address_of(sender),
                tokenId: object::object_address(&token),
                content
            }
        );

        token::burn(burn_ref);

    }

    entry fun createOrder(seller: &signer, token:Object<Token>, price: u64) acquires Orders {

        assert!( object::is_owner( token, address_of(seller) ), 2);

        let orders = borrow_global_mut<Orders>(@nftmarket);
        //order_counter is key
        orders.order_counter = orders.order_counter + 1;
        //create a new order
        let new_order = Order{
            orderId: orders.order_counter,
            seller: address_of(seller),
            price,
            token,
            completed: false
        };
        //upsert the new order to orders
        table::upsert(&mut orders.orders, orders.order_counter, new_order);
        //deposite the seller's NFT to ResourceAccount
        object::transfer(seller, token, account::create_resource_address(&@nftmarket, RESOURCECAPSEED));

        event::emit(
            new_order
        );

    }

    entry fun transfer(buyer: &signer, orderId: u64) acquires ResourceCap, Orders {

        let orders = borrow_global_mut<Orders>( @nftmarket );
        let order = table::borrow(&orders.orders, orderId);

        let tokenOfOrder = order.token;
        let tokenOfSeller = order.seller;
        let tokenOfPrice = order.price;
        let _ = order;

        //check the order state and the balance of buyer
        assert!( order.completed==false, 2 );
        assert!(coin::balance<AptosCoin>(signer::address_of(buyer)) >= order.price, 2);

        //transfer APT from buyer to seller
        coin::transfer<AptosCoin>(buyer, order.seller, order.price);

        //obtain the ResourceAccountSigner to transfer NFT
        let resource_cap = &borrow_global<ResourceCap>( account::create_resource_address( &@nftmarket, RESOURCECAPSEED) ).cap;
        let resource_signer = account::create_signer_with_capability( resource_cap );

        //transfer token from seller to buyer
        object::transfer( &resource_signer, order.token, address_of(buyer)  );

        table::remove(&mut orders.orders, orderId);

        event::emit(
            TransferEvent{
                buyer: address_of(buyer),
                seller: tokenOfSeller,
                price: tokenOfPrice,
                tokenId: object::object_address(&tokenOfOrder),
            }
        );

    }

    entry fun changePrice(orderId: u64, new_price: u64) acquires Orders {

        let orders = borrow_global_mut<Orders>( @nftmarket );
        let order = table::borrow_mut(&mut orders.orders, orderId);

        let old_price = order.price;
        order.price = new_price;

        event::emit(
            ChangePrice{
                orderId,
                old_price,
                new_price
            }
        );

    }

    entry fun cancelOrder( seller: &signer, orderId: u64) acquires Orders, ResourceCap {

        let orders = borrow_global_mut<Orders>( @nftmarket );
        let order = table::borrow(&orders.orders, orderId);

        let tokenOfOrder = order.token;
        let _ = order;

        //only the creater of order can cancel the order
        assert!( order.seller==address_of(seller), 2);

        let resource_cap = &borrow_global<ResourceCap>( account::create_resource_address( &@nftmarket, RESOURCECAPSEED) ).cap;
        let resource_signer = account::create_signer_with_capability( resource_cap );

        //ResourceAccount repay NFT to seller
        object::transfer(&resource_signer, order.token, address_of(seller));

        //remove order from orders
        table::remove( &mut orders.orders, orderId );

        event::emit(
          CancelOrder{
              orderId,
              seller: address_of(seller),
              token: object::object_address(&tokenOfOrder)
          }
        );

    }

}