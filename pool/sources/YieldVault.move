module Pool::flash_lender{
    friend Pool::locked_coins;

    use std::error;
    use std::signer::address_of;
    use aptos_framework::coin;
    use aptos_framework::coin::Coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::account;
    use aptos_framework::account::SignerCapability;

    struct Receipt {
        flash_lender_address: address,
        repay_amount: u64
    }

    struct AdminCap has key {
        Yield_address: address,
    }

    struct FlashPool has key {
        initial_total_supply: u64,
        total_supply: u64,
        fee: u64,
    }

    struct ResourceCap has key {
        cap: SignerCapability
    }



    const ResourceAccountSeed: vector<u8> = b"Yield_Seed";

    fun init_module(adminer: &signer) {

        let adminer_address = address_of(adminer);
        move_to(
            adminer,
            AdminCap{
                Yield_address: adminer_address,
            },
        );

        let (resource_signer, resource_cap) = account::create_resource_account(
            adminer,
            ResourceAccountSeed
        );
        move_to(
            &resource_signer,
            ResourceCap {
                cap: resource_cap
            }
        );

    }

    entry public fun new(
        owner: &signer,
        to_lend: u64,
        fees: u64,
    ) acquires ResourceCap {
        assert!(exists<AdminCap>(address_of(owner)), error::not_found(1));
        let coins = coin::withdraw<AptosCoin>(owner, to_lend);

        let resource_cap = &borrow_global<ResourceCap>(account::create_resource_address(
          &address_of(owner),
                ResourceAccountSeed,
        )).cap;

        let resource_signer = &account::create_signer_with_capability(
            resource_cap
        );
        coin::register<AptosCoin>(resource_signer);
        coin::deposit(address_of(resource_signer), coins);
        move_to(resource_signer,
            FlashPool{
                initial_total_supply: to_lend,
                total_supply: to_lend,
                fee: fees,
            }
        )
    }

     public fun loan(brrower: &signer, amounts: u64 ): (Coin<AptosCoin>, Receipt) acquires ResourceCap,FlashPool {
        let resource_address = account::create_resource_address(
                &@Pool,
                ResourceAccountSeed
            );
        let resource_cap = &borrow_global<ResourceCap>(resource_address).cap;

        let resource_signer = &account::create_signer_with_capability(resource_cap);

        let FlashPool{ initial_total_supply: _,
            total_supply,
            fee: fees ,} = borrow_global_mut<FlashPool>(resource_address);


        let loan = coin::withdraw<AptosCoin>(resource_signer, amounts);

         *total_supply = *total_supply - amounts;

        let receipt = Receipt{
            flash_lender_address: address_of(brrower),
            repay_amount: amounts+*fees,
        };
        (loan, receipt)
    }

    public fun repay(sender: &signer ,payment: Coin<AptosCoin>, receipt: Receipt) acquires FlashPool{
        let Receipt { flash_lender_address, repay_amount } = receipt;
        assert!(address_of(sender) ==flash_lender_address, error::not_found(1));

        let amount = coin::value(&payment);
        assert!(repay_amount == amount, error::not_found(1));

        let resource_address = account::create_resource_address(
            &@Pool,
            ResourceAccountSeed
        );

        let FlashPool{
            initial_total_supply,
            total_supply,
            fee: _,
        } = borrow_global_mut<FlashPool>(resource_address);

        *total_supply = *total_supply + repay_amount;

        assert!(*total_supply > *initial_total_supply, error::not_found(1));

        coin::deposit(resource_address, payment);
    }

    public fun claim_Yield(sender: &signer ,yieldFeeRecipient: address, yieldFee: u64) acquires AdminCap,FlashPool,ResourceCap {

        let sender_address =  address_of(sender);

        let yield_address = borrow_global<AdminCap>(sender_address).Yield_address;

        let resource_address = account::create_resource_address(
            &@Pool,
            ResourceAccountSeed
        );

        let resource_cap = &borrow_global<ResourceCap>(resource_address).cap;

        let resource_signer = &account::create_signer_with_capability(resource_cap);

        let FlashPool{
            initial_total_supply,
            total_supply,
            fee: _,
        } = borrow_global_mut<FlashPool>(resource_address);


        let yield = *total_supply - *initial_total_supply;

        total_supply = initial_total_supply;

        coin::transfer<AdminCap>(resource_signer, yieldFeeRecipient, yieldFee);

        coin::transfer<AdminCap>(resource_signer, yield_address, yield - yieldFee);
    }

    public(friend) fun withdraws(
        recipient: address,
        amounts: u64,
    ) acquires FlashPool,ResourceCap {

        assert!(amounts > 0, error::not_found(1));

        let resource_address = account::create_resource_address(
            &@Pool,
            ResourceAccountSeed
        );

        let resource_cap = &borrow_global<ResourceCap>(resource_address).cap;

        let resource_signer = &account::create_signer_with_capability(resource_cap);

        let FlashPool{
            initial_total_supply,
            total_supply,
            fee: _,
        } = borrow_global_mut<FlashPool>(resource_address);

        assert!(*total_supply >= amounts, error::not_found(1));
        *total_supply = *total_supply - amounts;
        assert!(*initial_total_supply >= amounts, error::not_found(1));
        *initial_total_supply = *initial_total_supply - amounts;

        coin::transfer<AptosCoin>(resource_signer, recipient, amounts);
    }

    public(friend) fun deposits(
        sender: &signer,
        amounts: u64,
    ) acquires FlashPool {
        assert!(amounts > 0, error::not_found(1));

        let resource_address = account::create_resource_address(
            &@Pool,
            ResourceAccountSeed
        );


        let FlashPool{
            initial_total_supply,
            total_supply,
            fee: _,
        } = borrow_global_mut<FlashPool>(resource_address);


        *total_supply = *total_supply + amounts;
        *initial_total_supply = *initial_total_supply + amounts;

        coin::transfer<AptosCoin>(sender, resource_address, amounts);
    }

    entry public fun update_fee(
        sender: &signer,
        new_fee: u64,
    ) acquires FlashPool {
        assert!(new_fee > 0, error::not_found(1));
        let sender_address = address_of(sender);
        assert!(exists<AdminCap>(sender_address), error::not_found(1));

        let resource_address = account::create_resource_address(
            &@Pool,
            ResourceAccountSeed
        );


        let FlashPool{
            initial_total_supply: _,
            total_supply: _,
            fee: fees,
        } = borrow_global_mut<FlashPool>(resource_address);
        *fees = new_fee;
    }

    public(friend) fun  updata_yield_address(sender_address: address, new_yield_address: address) acquires AdminCap {

        let AdminCap{ Yield_address: yield_address } = borrow_global_mut<AdminCap>(sender_address);

        *yield_address = new_yield_address;
    }

    #[view]
    public fun fee(): u64 acquires FlashPool {

        let resource_address = account::create_resource_address(
            &@Pool,
            ResourceAccountSeed
        );

        borrow_global<FlashPool>(resource_address).fee
    }

    #[view]
    public fun max_loan(): u64 acquires FlashPool {

        let resource_address = account::create_resource_address(
            &@Pool,
            ResourceAccountSeed
        );

        borrow_global<FlashPool>(resource_address).total_supply
    }

    #[view]
    public fun get_Yield(): u64 acquires FlashPool {

        let resource_address = account::create_resource_address(
            &@Pool,
            ResourceAccountSeed
        );

        borrow_global<FlashPool>(resource_address).total_supply - borrow_global<FlashPool>(resource_address).initial_total_supply
    }

    #[view]
    public fun  get_yield_address(adminer: address): address acquires AdminCap {

        borrow_global_mut<AdminCap>(adminer).Yield_address

    }
}