#[test_only]
module dapp::e2e{

    use std::features;
    use std::string;
    use dapp::dapp;
    #[test_only]
    fun init_for_test(sender: &signer, fx: &signer) {
    dapp::init_for_test(sender);
    let feature = features::get_concurrent_assets_feature();
    let agg_feature = features::get_aggregator_v2_api_feature();
    let auid_feature = features::get_auids();
    let module_event_feature = features::get_module_event_feature();
    features::change_feature_flags(fx, vector[auid_feature, module_event_feature], vector[feature, agg_feature]);
    }

    #[test(sender = @dapp)]
    fun test_init(sender: &signer) {
       dapp::init_for_test(sender);
    }

    #[test(sender = @dapp, minter = @0x1234, fx = @aptos_framework, )]
    fun test_mint(sender: &signer, minter: &signer, fx: &signer) {
        init_for_test(sender, fx);

        dapp::mint_single_collection(minter, string::utf8(b"https://image-mys.4everland.store/IMG_0714.JPG"));
    }
}
