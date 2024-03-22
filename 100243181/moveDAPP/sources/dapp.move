module my_dapp_addr::my_dapp {
     use 0x1::Vector;


    struct Item has store {
        name: vector<u8>,        
        rental_price: u64,      
        rental_duration: u64,   
        is_rented: bool         
    }

      struct LeaseContract has key {
        items: vector<Item>,   
        rents: vector<u64>      
    }
     public fun start_collection(account: &signer) {
        move_to<LeaseContract>(account, LeaseContract {
            items: Vector::empty<LeaseContract>()
        })
    }

    public fun publish_item(
        lease: &mut LeaseContract,
        name: vector<u8>,
        rental_price: u64,
        rental_duration: u64
    ) {
        let new_item = Item {
            name: name,
            rental_price: rental_price,
            rental_duration: rental_duration,
            is_rented: false
        };

         move_to(lease.items,new_item)
    }


    public fun rent_item(
        lease: &mut LeaseContract,
        item_id: u64
    ) {

        assert(item_id < lease.items.len(), 101, "Item does not exist");
 
        assert(!lease.items[item_id].is_rented, 102, "Item is already rented");

        lease.items[item_id].is_rented = true;
    }


    public fun return_item(
        &mut lease: &mut LeaseContract,
        item_id: u64
    ) {

        assert(item_id < lease.items.len(), 101, "Item does not exist");

        assert(lease.items[item_id].is_rented, 103, "Item is not rented");

        lease.items[item_id].is_rented = false;
    }

    public fun get_item_info(
        lease: &LeaseContract,
        item_id: u64
    ): &Item {
        assert(item_id < lease.items.len(), 101, "Item does not exist");
        return &lease.items[item_id];
    }

}