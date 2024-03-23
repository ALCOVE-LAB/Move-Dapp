module cccy::randoom{
    use std::signer;
    use std::vector;
    use aptos_std::smart_vector;
    use aptos_std::smart_vector::SmartVector;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::coin;
    use aptos_framework::coin::Coin;
    use aptos_framework::event;
    use aptos_framework::randomness;
	
    #[event]
    struct Event<T> has drop,store{
        value: T
    }

    #[event]
    struct Winner has drop,store{ \
        value: address
    }

    entry fun random_u8(){
        event::emit(
            Event{
           
                value:randomness::u8_integer()
            }
        );
    }
    fun init_module(caller:&signer){
        move_to(caller,Pools{
        	titckets_user: smart_vector::empty(),
            
            coins:coin::zero(),
            
            is_closed:false
        })
    }

    struct Pools has key {
    		
        titckets_user: SmartVector<address>,
        number:vector<u64>,
        coins:Coin<AptosCoin>,
        is_closed:bool
    }

    
    public fun get_ticket_price():u64{TICKET_PRICE}
    const TICKET_PRICE:u64 = 10_000;

    entry fun pick_winner() acquires Pools {
        draw_winner();
    }

    
     fun draw_winner() acquires Pools{
     		
        let pool = borrow_global_mut<Pools>(@cccy);
               assert!(!pool.is_closed,HAS_CLOSE); // close ?
                assert!(!smart_vector::is_empty(&pool.titckets_user),NO_TICKETS); // buy tickets ?
        
        let winner_id = randomness::u64_range(0,smart_vector::length(&pool.titckets_user));
       
        let winner = *smart_vector::borrow(&pool.titckets_user,winner_id);
        
        let coins = coin::extract_all(&mut pool.coins);
    
        coin::deposit<AptosCoin>(winner,coins);

        pool.is_closed = true;

        event::emit(
            Winner{
                value:winner
            }
        );
    }

    const HAS_CLOSE:u64 = 403; 
    const NO_TICKETS:u64 = 404; 

    #[test_only]
    public(friend) fun init_module_test(caller:&signer)  {
        init_module(caller);
    }
}