module buiry::dataset_listing {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};

    struct DatasetListing has key, store {
        id: UID,
        walrus_blob_id: vector<u8>,
        category: vector<u8>,
        domain: vector<u8>,
        owner: address,
        sample_size: u64,
        price_mist: u64,
        is_public: bool,
        generated_at: u64,
    }

    public fun create(
        walrus_blob_id: vector<u8>,
        category: vector<u8>,
        domain: vector<u8>,
        sample_size: u64,
        ctx: &mut TxContext,
    ): DatasetListing {
        DatasetListing {
            id: object::new(ctx),
            walrus_blob_id,
            category,
            domain,
            owner: tx_context::sender(ctx),
            sample_size,
            price_mist: 0,
            is_public: false,
            generated_at: tx_context::epoch(ctx),
        }
    }

    public fun list_on_marketplace(listing: &mut DatasetListing, price: u64, ctx: &TxContext) {
        assert!(listing.owner == tx_context::sender(ctx), 0);
        listing.price_mist = price;
        listing.is_public = true;
    }
}
