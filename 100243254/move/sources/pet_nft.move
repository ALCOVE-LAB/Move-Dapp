module pet_nft::main {
    use aptos_framework::object::{Self, ExtendRef};
    use aptos_framework::event;
    use aptos_framework::account;
    use aptos_token_objects::token;
    use aptos_token_objects::collection;
    use std::signer;
    use std::string::{Self, String};
    use aptos_std::string_utils::{to_string};
    use std::option;
    use std::error;
    use std::signer::address_of;

    const APP_SEED_NAME: vector<u8> = b"PetNFT";
    const PET_COLLECTION_NAME: vector<u8> = b"Pet Collection";
    const PET_COLLECTION_DESCRIPTION: vector<u8> = b"Collection of pet NFTs";
    const PET_COLLECTION_URI: vector<u8> = b"https://pixabay.com/photos/cat-kitten-pet-kitty-young-cat-551554";

    struct Pet has key {
        owner: address,
        name: String,
        burn_ref: token::BurnRef,
    }

    struct PetCollectionSigner has key {
        extend_ref: ExtendRef
    }

    struct MintPetEvent has drop, store {
        token_name: String,
        pet_name: String,
    }

    struct MintPetEvents has key {
        mint_pet_events: event::EventHandle<MintPetEvent>,
    }

    fun init_module(creator: &signer) {
        let creator_ref = object::create_named_object(creator, APP_SEED_NAME);
        let extend_ref = object::generate_extend_ref(&creator_ref);

        let pet_collection_signer = &object::generate_signer(&creator_ref);

        move_to(creator, MintPetEvents {
            mint_pet_events: account::new_event_handle<MintPetEvent>(creator),
        });

        move_to(pet_collection_signer, PetCollectionSigner {
            extend_ref
        });

        create_pet_collection(pet_collection_signer);
    }

    fun get_creator_signer_address(): address {
        object::create_object_address(&@pet_nft, APP_SEED_NAME)
    }

    fun get_pet_collection_signer(): signer acquires PetCollectionSigner {
        let signer_address = get_creator_signer_address();
        object::generate_signer_for_extending(&borrow_global<PetCollectionSigner>(signer_address).extend_ref)
    }

    fun create_pet_collection(creator: &signer) {
        let name = get_pet_collection_name();
        let description = get_pet_collection_description();
        let uri = get_pet_collection_uri();

        collection::create_unlimited_collection(creator, description, name, option::none(), uri);
    }

    public entry fun mint_pet(user: &signer, name: String) acquires PetCollectionSigner, MintPetEvents {
        let nft_collection_name = get_pet_collection_name();
        let nft_description = get_pet_collection_description();
        let nft_uri = get_pet_collection_uri();
        let use_address = signer::address_of(user);

        let pet_collection_signer = get_pet_collection_signer();

        let token_name = to_string(&use_address);
        let token_ref = token::create_named_token(
            &pet_collection_signer,
            nft_collection_name,
            nft_description,
            token_name,
            option::none(),
            nft_uri
        );

        let token_signer = object::generate_signer(&token_ref);
        let token_burn_ref = token::generate_burn_ref(&token_ref);
        let token_transfer_ref = object::generate_transfer_ref(&token_ref);

        let pet = Pet {
            owner: use_address,
            name,
            burn_ref: token_burn_ref,
        };

        move_to(&token_signer, pet);

        event::emit_event<MintPetEvent>(
            &mut borrow_global_mut<MintPetEvents>(@pet_nft).mint_pet_events,
            MintPetEvent {
                token_name,
                pet_name: name,
            },
        );

        object::transfer_with_ref(object::generate_linear_transfer_ref(&token_transfer_ref),address_of(user));
    }

    public entry fun update_pet_name(user: signer, name: String) acquires Pet {
        let user_address = address_of(&user);
        assert!(has_pet(user_address), error::unavailable(1));

        let token_address = get_pet_nft_address(user_address);

        let pet = borrow_global_mut<Pet>(token_address);
        pet.name = name;
    }

    public entry fun bury_pet(user: signer) acquires Pet {
        let user_address = address_of(&user);
        assert!(has_pet(user_address), error::unavailable(1));

        let token_address = get_pet_nft_address(user_address);

        let Pet {
            owner: _,
            burn_ref,
            name: _,
        } = move_from<Pet>(token_address);

        token::burn(burn_ref);
    }

    #[view]
    public fun get_pet_collection_name(): (String) {
        string::utf8(PET_COLLECTION_NAME)
    }

    #[view]
    public fun get_pet_collection_description(): (String) {
        string::utf8(PET_COLLECTION_DESCRIPTION)
    }

    #[view]
    public fun get_pet_collection_uri(): (String) {
        string::utf8(PET_COLLECTION_URI)
    }

    #[view]
    public fun get_pet_collection_id(): (address) {
        let collection_name = get_pet_collection_name();
        let creator_addr = get_creator_signer_address();
        collection::create_collection_address(&creator_addr, &collection_name)
    }

    #[view]
    public fun get_pet_nft_address(creator_address: address): (address) {
        let pet_collection_name = get_pet_collection_name();
        let token_name = to_string(&creator_address);
        let creator_address = get_creator_signer_address();
        let token_address = token::create_token_address(&creator_address, &pet_collection_name, &token_name);

        token_address
    }

    #[view]
    public fun has_pet(user_address: address): (bool) {
        let pet_token_address = get_pet_nft_address(user_address);
        exists<Pet>(pet_token_address)
    }

    #[view]
    public fun get_pet_name(user_address: address): (String) acquires Pet{
        assert!(has_pet(user_address), error::unavailable(1));
        let pet_token_address = get_pet_nft_address(user_address);
        let pet = borrow_global<Pet>(pet_token_address);

        pet.name
    }


}
