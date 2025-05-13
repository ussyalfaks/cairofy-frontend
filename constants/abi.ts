[
    {
      "type": "function",
      "name": "pause",
      "inputs": [],
      "outputs": [],
      "state_mutability": "external"
    },
    {
      "type": "function",
      "name": "unpause",
      "inputs": [],
      "outputs": [],
      "state_mutability": "external"
    },
    {
      "type": "impl",
      "name": "UpgradeableImpl",
      "interface_name": "openzeppelin_upgrades::interface::IUpgradeable"
    },
    {
      "type": "interface",
      "name": "openzeppelin_upgrades::interface::IUpgradeable",
      "items": [
        {
          "type": "function",
          "name": "upgrade",
          "inputs": [
            {
              "name": "new_class_hash",
              "type": "core::starknet::class_hash::ClassHash"
            }
          ],
          "outputs": [],
          "state_mutability": "external"
        }
      ]
    },
    {
      "type": "impl",
      "name": "CairofyImpl",
      "interface_name": "cairofy_contract::interfaces::ICairofy::ICairofy"
    },
    {
      "type": "struct",
      "name": "core::integer::u256",
      "members": [
        {
          "name": "low",
          "type": "core::integer::u128"
        },
        {
          "name": "high",
          "type": "core::integer::u128"
        }
      ]
    },
    {
      "type": "enum",
      "name": "core::bool",
      "variants": [
        {
          "name": "False",
          "type": "()"
        },
        {
          "name": "True",
          "type": "()"
        }
      ]
    },
    {
      "type": "struct",
      "name": "cairofy_contract::structs::Structs::Song",
      "members": [
        {
          "name": "name",
          "type": "core::felt252"
        },
        {
          "name": "ipfs_hash",
          "type": "core::felt252"
        },
        {
          "name": "preview_ipfs_hash",
          "type": "core::felt252"
        },
        {
          "name": "price",
          "type": "core::integer::u256"
        },
        {
          "name": "owner",
          "type": "core::starknet::contract_address::ContractAddress"
        },
        {
          "name": "for_sale",
          "type": "core::bool"
        }
      ]
    },
    {
      "type": "interface",
      "name": "cairofy_contract::interfaces::ICairofy::ICairofy",
      "items": [
        {
          "type": "function",
          "name": "register_song",
          "inputs": [
            {
              "name": "name",
              "type": "core::felt252"
            },
            {
              "name": "ipfs_hash",
              "type": "core::felt252"
            },
            {
              "name": "preview_ipfs_hash",
              "type": "core::felt252"
            },
            {
              "name": "price",
              "type": "core::integer::u256"
            },
            {
              "name": "for_sale",
              "type": "core::bool"
            }
          ],
          "outputs": [
            {
              "type": "core::integer::u64"
            }
          ],
          "state_mutability": "external"
        },
        {
          "type": "function",
          "name": "get_song_info",
          "inputs": [
            {
              "name": "song_id",
              "type": "core::integer::u64"
            }
          ],
          "outputs": [
            {
              "type": "cairofy_contract::structs::Structs::Song"
            }
          ],
          "state_mutability": "view"
        },
        {
          "type": "function",
          "name": "update_song_price",
          "inputs": [
            {
              "name": "song_id",
              "type": "core::integer::u64"
            },
            {
              "name": "new_price",
              "type": "core::integer::u256"
            }
          ],
          "outputs": [],
          "state_mutability": "external"
        },
        {
          "type": "function",
          "name": "get_preview",
          "inputs": [
            {
              "name": "song_id",
              "type": "core::integer::u64"
            }
          ],
          "outputs": [
            {
              "type": "core::felt252"
            }
          ],
          "state_mutability": "view"
        },
        {
          "type": "function",
          "name": "buy_song",
          "inputs": [
            {
              "name": "song_id",
              "type": "core::integer::u64"
            }
          ],
          "outputs": [
            {
              "type": "core::felt252"
            }
          ],
          "state_mutability": "external"
        },
        {
          "type": "function",
          "name": "get_user_songs",
          "inputs": [
            {
              "name": "user",
              "type": "core::starknet::contract_address::ContractAddress"
            }
          ],
          "outputs": [
            {
              "type": "core::array::Array::<core::integer::u64>"
            }
          ],
          "state_mutability": "view"
        },
        {
          "type": "function",
          "name": "is_song_owner",
          "inputs": [
            {
              "name": "song_id",
              "type": "core::integer::u64"
            }
          ],
          "outputs": [
            {
              "type": "core::bool"
            }
          ],
          "state_mutability": "view"
        }
      ]
    },
    {
      "type": "impl",
      "name": "PausableImpl",
      "interface_name": "openzeppelin_security::interface::IPausable"
    },
    {
      "type": "interface",
      "name": "openzeppelin_security::interface::IPausable",
      "items": [
        {
          "type": "function",
          "name": "is_paused",
          "inputs": [],
          "outputs": [
            {
              "type": "core::bool"
            }
          ],
          "state_mutability": "view"
        }
      ]
    },
    {
      "type": "impl",
      "name": "OwnableMixinImpl",
      "interface_name": "openzeppelin_access::ownable::interface::OwnableABI"
    },
    {
      "type": "interface",
      "name": "openzeppelin_access::ownable::interface::OwnableABI",
      "items": [
        {
          "type": "function",
          "name": "owner",
          "inputs": [],
          "outputs": [
            {
              "type": "core::starknet::contract_address::ContractAddress"
            }
          ],
          "state_mutability": "view"
        },
        {
          "type": "function",
          "name": "transfer_ownership",
          "inputs": [
            {
              "name": "new_owner",
              "type": "core::starknet::contract_address::ContractAddress"
            }
          ],
          "outputs": [],
          "state_mutability": "external"
        },
        {
          "type": "function",
          "name": "renounce_ownership",
          "inputs": [],
          "outputs": [],
          "state_mutability": "external"
        },
        {
          "type": "function",
          "name": "transferOwnership",
          "inputs": [
            {
              "name": "newOwner",
              "type": "core::starknet::contract_address::ContractAddress"
            }
          ],
          "outputs": [],
          "state_mutability": "external"
        },
        {
          "type": "function",
          "name": "renounceOwnership",
          "inputs": [],
          "outputs": [],
          "state_mutability": "external"
        }
      ]
    },
    {
      "type": "constructor",
      "name": "constructor",
      "inputs": [
        {
          "name": "owner",
          "type": "core::starknet::contract_address::ContractAddress"
        },
        {
          "name": "token_addr",
          "type": "core::starknet::contract_address::ContractAddress"
        }
      ]
    },
    {
      "type": "event",
      "name": "openzeppelin_security::pausable::PausableComponent::Paused",
      "kind": "struct",
      "members": [
        {
          "name": "account",
          "type": "core::starknet::contract_address::ContractAddress",
          "kind": "data"
        }
      ]
    },
    {
      "type": "event",
      "name": "openzeppelin_security::pausable::PausableComponent::Unpaused",
      "kind": "struct",
      "members": [
        {
          "name": "account",
          "type": "core::starknet::contract_address::ContractAddress",
          "kind": "data"
        }
      ]
    },
    {
      "type": "event",
      "name": "openzeppelin_security::pausable::PausableComponent::Event",
      "kind": "enum",
      "variants": [
        {
          "name": "Paused",
          "type": "openzeppelin_security::pausable::PausableComponent::Paused",
          "kind": "nested"
        },
        {
          "name": "Unpaused",
          "type": "openzeppelin_security::pausable::PausableComponent::Unpaused",
          "kind": "nested"
        }
      ]
    },
    {
      "type": "event",
      "name": "openzeppelin_access::ownable::ownable::OwnableComponent::OwnershipTransferred",
      "kind": "struct",
      "members": [
        {
          "name": "previous_owner",
          "type": "core::starknet::contract_address::ContractAddress",
          "kind": "key"
        },
        {
          "name": "new_owner",
          "type": "core::starknet::contract_address::ContractAddress",
          "kind": "key"
        }
      ]
    },
    {
      "type": "event",
      "name": "openzeppelin_access::ownable::ownable::OwnableComponent::OwnershipTransferStarted",
      "kind": "struct",
      "members": [
        {
          "name": "previous_owner",
          "type": "core::starknet::contract_address::ContractAddress",
          "kind": "key"
        },
        {
          "name": "new_owner",
          "type": "core::starknet::contract_address::ContractAddress",
          "kind": "key"
        }
      ]
    },
    {
      "type": "event",
      "name": "openzeppelin_access::ownable::ownable::OwnableComponent::Event",
      "kind": "enum",
      "variants": [
        {
          "name": "OwnershipTransferred",
          "type": "openzeppelin_access::ownable::ownable::OwnableComponent::OwnershipTransferred",
          "kind": "nested"
        },
        {
          "name": "OwnershipTransferStarted",
          "type": "openzeppelin_access::ownable::ownable::OwnableComponent::OwnershipTransferStarted",
          "kind": "nested"
        }
      ]
    },
    {
      "type": "event",
      "name": "openzeppelin_upgrades::upgradeable::UpgradeableComponent::Upgraded",
      "kind": "struct",
      "members": [
        {
          "name": "class_hash",
          "type": "core::starknet::class_hash::ClassHash",
          "kind": "data"
        }
      ]
    },
    {
      "type": "event",
      "name": "openzeppelin_upgrades::upgradeable::UpgradeableComponent::Event",
      "kind": "enum",
      "variants": [
        {
          "name": "Upgraded",
          "type": "openzeppelin_upgrades::upgradeable::UpgradeableComponent::Upgraded",
          "kind": "nested"
        }
      ]
    },
    {
      "type": "event",
      "name": "cairofy_contract::events::Events::Song_Registered",
      "kind": "struct",
      "members": [
        {
          "name": "song_id",
          "type": "core::integer::u64",
          "kind": "data"
        },
        {
          "name": "name",
          "type": "core::felt252",
          "kind": "data"
        },
        {
          "name": "ipfs_hash",
          "type": "core::felt252",
          "kind": "data"
        },
        {
          "name": "preview_ipfs_hash",
          "type": "core::felt252",
          "kind": "data"
        },
        {
          "name": "price",
          "type": "core::integer::u256",
          "kind": "data"
        },
        {
          "name": "for_sale",
          "type": "core::bool",
          "kind": "data"
        }
      ]
    },
    {
      "type": "event",
      "name": "cairofy_contract::events::Events::SongPriceUpdated",
      "kind": "struct",
      "members": [
        {
          "name": "song_id",
          "type": "core::integer::u64",
          "kind": "data"
        },
        {
          "name": "name",
          "type": "core::felt252",
          "kind": "data"
        },
        {
          "name": "ipfs_hash",
          "type": "core::felt252",
          "kind": "data"
        },
        {
          "name": "preview_ipfs_hash",
          "type": "core::felt252",
          "kind": "data"
        },
        {
          "name": "updated_price",
          "type": "core::integer::u256",
          "kind": "data"
        },
        {
          "name": "for_sale",
          "type": "core::bool",
          "kind": "data"
        }
      ]
    },
    {
      "type": "event",
      "name": "cairofy_contract::contracts::Cairofy::CairofyV0::Event",
      "kind": "enum",
      "variants": [
        {
          "name": "PausableEvent",
          "type": "openzeppelin_security::pausable::PausableComponent::Event",
          "kind": "flat"
        },
        {
          "name": "OwnableEvent",
          "type": "openzeppelin_access::ownable::ownable::OwnableComponent::Event",
          "kind": "flat"
        },
        {
          "name": "UpgradeableEvent",
          "type": "openzeppelin_upgrades::upgradeable::UpgradeableComponent::Event",
          "kind": "flat"
        },
        {
          "name": "Song_Registered",
          "type": "cairofy_contract::events::Events::Song_Registered",
          "kind": "nested"
        },
        {
          "name": "SongPriceUpdated",
          "type": "cairofy_contract::events::Events::SongPriceUpdated",
          "kind": "nested"
        }
      ]
    }
  ]