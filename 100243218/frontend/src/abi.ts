export const ABI = {
    "address": "0x770381698147286b87c506c65c8e982e1f0199d071dba987a0daee8f79c663a7",
    "name": "oneclicknft",
    "friends": [],
    "exposed_functions": [
      {
        "name": "burn",
        "visibility": "private",
        "is_entry": true,
        "is_view": false,
        "generic_type_params": [],
        "params": [
          "&signer",
          "0x1::object::Object<0x770381698147286b87c506c65c8e982e1f0199d071dba987a0daee8f79c663a7::oneclicknft::Content>"
        ],
        "return": []
      },
      {
        "name": "get_content",
        "visibility": "public",
        "is_entry": false,
        "is_view": true,
        "generic_type_params": [],
        "params": [
          "0x1::object::Object<0x770381698147286b87c506c65c8e982e1f0199d071dba987a0daee8f79c663a7::oneclicknft::Content>"
        ],
        "return": [
          "0x770381698147286b87c506c65c8e982e1f0199d071dba987a0daee8f79c663a7::oneclicknft::Content"
        ]
      },
      {
        "name": "mint",
        "visibility": "public",
        "is_entry": true,
        "is_view": false,
        "generic_type_params": [],
        "params": [
          "&signer",
          "0x1::string::String",
          "0x1::string::String",
          "0x1::string::String"
        ],
        "return": []
      }
    ],
    "structs": [
      {
        "name": "BurnEvent",
        "is_native": false,
        "abilities": [
          "drop",
          "store"
        ],
        "generic_type_params": [],
        "fields": [
          {
            "name": "owner",
            "type": "address"
          },
          {
            "name": "token_id",
            "type": "address"
          },
          {
            "name": "content",
            "type": "0x770381698147286b87c506c65c8e982e1f0199d071dba987a0daee8f79c663a7::oneclicknft::Content"
          }
        ]
      },
      {
        "name": "CollectionRefsStore",
        "is_native": false,
        "abilities": [
          "key"
        ],
        "generic_type_params": [],
        "fields": [
          {
            "name": "mutator_ref",
            "type": "0x4::collection::MutatorRef"
          }
        ]
      },
      {
        "name": "Content",
        "is_native": false,
        "abilities": [
          "drop",
          "store",
          "key"
        ],
        "generic_type_params": [],
        "fields": [
          {
            "name": "name",
            "type": "0x1::string::String"
          },
          {
            "name": "link",
            "type": "0x1::string::String"
          },
          {
            "name": "description",
            "type": "0x1::string::String"
          }
        ]
      },
      {
        "name": "MintEvent",
        "is_native": false,
        "abilities": [
          "drop",
          "store"
        ],
        "generic_type_params": [],
        "fields": [
          {
            "name": "owner",
            "type": "address"
          },
          {
            "name": "token_id",
            "type": "address"
          },
          {
            "name": "content",
            "type": "0x770381698147286b87c506c65c8e982e1f0199d071dba987a0daee8f79c663a7::oneclicknft::Content"
          }
        ]
      },
      {
        "name": "ResourceCap",
        "is_native": false,
        "abilities": [
          "key"
        ],
        "generic_type_params": [],
        "fields": [
          {
            "name": "cap",
            "type": "0x1::account::SignerCapability"
          }
        ]
      },
      {
        "name": "SetContentEvent",
        "is_native": false,
        "abilities": [
          "drop",
          "store"
        ],
        "generic_type_params": [],
        "fields": [
          {
            "name": "owner",
            "type": "address"
          },
          {
            "name": "token_id",
            "type": "address"
          },
          {
            "name": "old_content",
            "type": "0x770381698147286b87c506c65c8e982e1f0199d071dba987a0daee8f79c663a7::oneclicknft::Content"
          },
          {
            "name": "new_content",
            "type": "0x770381698147286b87c506c65c8e982e1f0199d071dba987a0daee8f79c663a7::oneclicknft::Content"
          }
        ]
      },
      {
        "name": "TokenRefsStore",
        "is_native": false,
        "abilities": [
          "key"
        ],
        "generic_type_params": [],
        "fields": [
          {
            "name": "mutator_ref",
            "type": "0x4::token::MutatorRef"
          },
          {
            "name": "burn_ref",
            "type": "0x4::token::BurnRef"
          },
          {
            "name": "extend_ref",
            "type": "0x1::object::ExtendRef"
          },
          {
            "name": "transfer_ref",
            "type": "0x1::option::Option<0x1::object::TransferRef>"
          }
        ]
      }
    ]
  } as const
  