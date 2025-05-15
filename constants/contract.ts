// Contract ABIs and addresses

// Supermarket contract address on Starknet Sepolia
export const CAIROFY_CONTRACT_ADDRESS = "0x07059bd584818a02e7f8268bf6f29f8fc879c04b61f19a91cc261e4f3167bff0";

// Basic ABI for the Supermarket contract
import type { Abi } from 'starknet';

export const CAIROFY_ABI: Abi = [
  {
    "name": "pause",
    "type": "function",
    "inputs": [],
    "outputs": [],
    "state_mutability": "external"
  },
  {
    "name": "unpause",
    "type": "function",
    "inputs": [],
    "outputs": [],
    "state_mutability": "external"
  },
  {
    "name": "UpgradeableImpl",
    "type": "impl",
    "interface_name": "openzeppelin_upgrades::interface::IUpgradeable"
  },
  {
    "name": "openzeppelin_upgrades::interface::IUpgradeable",
    "type": "interface",
    "items": [
      {
        "name": "upgrade",
        "type": "function",
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
    "name": "CairofyImpl",
    "type": "impl",
    "interface_name": "cairofy_contract::interfaces::ICairofy::ICairofy"
  },
  {
    "name": "core::integer::u256",
    "type": "struct",
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
    "name": "core::bool",
    "type": "enum",
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
    "name": "cairofy_contract::structs::Structs::Song",
    "type": "struct",
    "members": [
      {
        "name": "id",
        "type": "core::integer::u64"
      },
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
    "name": "cairofy_contract::structs::Structs::UserSubscription",
    "type": "struct",
    "members": [
      {
        "name": "start_date",
        "type": "core::integer::u64"
      },
      {
        "name": "expiry_date",
        "type": "core::integer::u64"
      },
      {
        "name": "user",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "name": "subscription_id",
        "type": "core::integer::u64"
      },
      {
        "name": "user_id",
        "type": "core::integer::u256"
      }
    ]
  },
  {
    "name": "cairofy_contract::structs::Structs::User",
    "type": "struct",
    "members": [
      {
        "name": "user_name",
        "type": "core::felt252"
      },
      {
        "name": "user",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "name": "has_subscribed",
        "type": "core::bool"
      },
      {
        "name": "user_id",
        "type": "core::integer::u256"
      }
    ]
  },
  {
    "name": "cairofy_contract::structs::Structs::PlatformStats",
    "type": "struct",
    "members": [
      {
        "name": "total_suscribers",
        "type": "core::integer::u64"
      },
      {
        "name": "platform_revenue",
        "type": "core::integer::u256"
      }
    ]
  },
  {
    "name": "cairofy_contract::structs::Structs::SongStats",
    "type": "struct",
    "members": [
      {
        "name": "song_id",
        "type": "core::integer::u64"
      },
      {
        "name": "name",
        "type": "core::felt252"
      },
      {
        "name": "play_count",
        "type": "core::integer::u64"
      },
      {
        "name": "revenue_generated",
        "type": "core::integer::u64"
      }
    ]
  },
  {
    "name": "cairofy_contract::interfaces::ICairofy::ICairofy",
    "type": "interface",
    "items": [
      {
        "name": "register_song",
        "type": "function",
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
        "name": "get_song_info",
        "type": "function",
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
        "name": "get_song_count",
        "type": "function",
        "inputs": [],
        "outputs": [
          {
            "type": "core::integer::u64"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "update_song_price",
        "type": "function",
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
        "name": "get_preview",
        "type": "function",
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
        "name": "buy_song",
        "type": "function",
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
        "name": "subscribe",
        "type": "function",
        "inputs": [],
        "outputs": [
          {
            "type": "core::integer::u64"
          }
        ],
        "state_mutability": "external"
      },
      {
        "name": "get_user_subscription",
        "type": "function",
        "inputs": [
          {
            "name": "user",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "cairofy_contract::structs::Structs::UserSubscription"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "get_user",
        "type": "function",
        "inputs": [
          {
            "name": "caller",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "cairofy_contract::structs::Structs::User"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "get_subscription_count",
        "type": "function",
        "inputs": [],
        "outputs": [
          {
            "type": "core::integer::u64"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "set_song_for_sale",
        "type": "function",
        "inputs": [
          {
            "name": "song_id",
            "type": "core::integer::u64"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "name": "update_subscription_details",
        "type": "function",
        "inputs": [
          {
            "name": "user",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "cairofy_contract::structs::Structs::UserSubscription"
          }
        ],
        "state_mutability": "external"
      },
      {
        "name": "stream_song",
        "type": "function",
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
        "name": "get_all_songs",
        "type": "function",
        "inputs": [],
        "outputs": [
          {
            "type": "core::array::Array::<cairofy_contract::structs::Structs::Song>"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "update_user",
        "type": "function",
        "inputs": [
          {
            "name": "caller",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "cairofy_contract::structs::Structs::User"
          }
        ],
        "state_mutability": "external"
      },
      {
        "name": "get_user_songs",
        "type": "function",
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
        "name": "is_song_owner",
        "type": "function",
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
      },
      {
        "name": "get_platform_stats",
        "type": "function",
        "inputs": [],
        "outputs": [
          {
            "type": "cairofy_contract::structs::Structs::PlatformStats"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "get_popular_songs_stats",
        "type": "function",
        "inputs": [
          {
            "name": "limit",
            "type": "core::integer::u64"
          }
        ],
        "outputs": [
          {
            "type": "core::array::Array::<cairofy_contract::structs::Structs::SongStats>"
          }
        ],
        "state_mutability": "view"
      }
    ]
  },
  {
    "name": "PausableImpl",
    "type": "impl",
    "interface_name": "openzeppelin_security::interface::IPausable"
  },
  {
    "name": "openzeppelin_security::interface::IPausable",
    "type": "interface",
    "items": [
      {
        "name": "is_paused",
        "type": "function",
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
    "name": "OwnableMixinImpl",
    "type": "impl",
    "interface_name": "openzeppelin_access::ownable::interface::OwnableABI"
  },
  {
    "name": "openzeppelin_access::ownable::interface::OwnableABI",
    "type": "interface",
    "items": [
      {
        "name": "owner",
        "type": "function",
        "inputs": [],
        "outputs": [
          {
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "transfer_ownership",
        "type": "function",
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
        "name": "renounce_ownership",
        "type": "function",
        "inputs": [],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "name": "transferOwnership",
        "type": "function",
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
        "name": "renounceOwnership",
        "type": "function",
        "inputs": [],
        "outputs": [],
        "state_mutability": "external"
      }
    ]
  },
  {
    "name": "constructor",
    "type": "constructor",
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
    "kind": "struct",
    "name": "openzeppelin_security::pausable::PausableComponent::Paused",
    "type": "event",
    "members": [
      {
        "kind": "data",
        "name": "account",
        "type": "core::starknet::contract_address::ContractAddress"
      }
    ]
  },
  {
    "kind": "struct",
    "name": "openzeppelin_security::pausable::PausableComponent::Unpaused",
    "type": "event",
    "members": [
      {
        "kind": "data",
        "name": "account",
        "type": "core::starknet::contract_address::ContractAddress"
      }
    ]
  },
  {
    "kind": "enum",
    "name": "openzeppelin_security::pausable::PausableComponent::Event",
    "type": "event",
    "variants": [
      {
        "kind": "nested",
        "name": "Paused",
        "type": "openzeppelin_security::pausable::PausableComponent::Paused"
      },
      {
        "kind": "nested",
        "name": "Unpaused",
        "type": "openzeppelin_security::pausable::PausableComponent::Unpaused"
      }
    ]
  },
  {
    "kind": "struct",
    "name": "openzeppelin_access::ownable::ownable::OwnableComponent::OwnershipTransferred",
    "type": "event",
    "members": [
      {
        "kind": "key",
        "name": "previous_owner",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "kind": "key",
        "name": "new_owner",
        "type": "core::starknet::contract_address::ContractAddress"
      }
    ]
  },
  {
    "kind": "struct",
    "name": "openzeppelin_access::ownable::ownable::OwnableComponent::OwnershipTransferStarted",
    "type": "event",
    "members": [
      {
        "kind": "key",
        "name": "previous_owner",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "kind": "key",
        "name": "new_owner",
        "type": "core::starknet::contract_address::ContractAddress"
      }
    ]
  },
  {
    "kind": "enum",
    "name": "openzeppelin_access::ownable::ownable::OwnableComponent::Event",
    "type": "event",
    "variants": [
      {
        "kind": "nested",
        "name": "OwnershipTransferred",
        "type": "openzeppelin_access::ownable::ownable::OwnableComponent::OwnershipTransferred"
      },
      {
        "kind": "nested",
        "name": "OwnershipTransferStarted",
        "type": "openzeppelin_access::ownable::ownable::OwnableComponent::OwnershipTransferStarted"
      }
    ]
  },
  {
    "kind": "struct",
    "name": "openzeppelin_upgrades::upgradeable::UpgradeableComponent::Upgraded",
    "type": "event",
    "members": [
      {
        "kind": "data",
        "name": "class_hash",
        "type": "core::starknet::class_hash::ClassHash"
      }
    ]
  },
  {
    "kind": "enum",
    "name": "openzeppelin_upgrades::upgradeable::UpgradeableComponent::Event",
    "type": "event",
    "variants": [
      {
        "kind": "nested",
        "name": "Upgraded",
        "type": "openzeppelin_upgrades::upgradeable::UpgradeableComponent::Upgraded"
      }
    ]
  },
  {
    "kind": "struct",
    "name": "cairofy_contract::events::Events::Song_Registered",
    "type": "event",
    "members": [
      {
        "kind": "data",
        "name": "song_id",
        "type": "core::integer::u64"
      },
      {
        "kind": "data",
        "name": "name",
        "type": "core::felt252"
      },
      {
        "kind": "data",
        "name": "ipfs_hash",
        "type": "core::felt252"
      },
      {
        "kind": "data",
        "name": "preview_ipfs_hash",
        "type": "core::felt252"
      },
      {
        "kind": "data",
        "name": "price",
        "type": "core::integer::u256"
      },
      {
        "kind": "data",
        "name": "for_sale",
        "type": "core::bool"
      }
    ]
  },
  {
    "kind": "struct",
    "name": "cairofy_contract::events::Events::SongPriceUpdated",
    "type": "event",
    "members": [
      {
        "kind": "data",
        "name": "song_id",
        "type": "core::integer::u64"
      },
      {
        "kind": "data",
        "name": "name",
        "type": "core::felt252"
      },
      {
        "kind": "data",
        "name": "ipfs_hash",
        "type": "core::felt252"
      },
      {
        "kind": "data",
        "name": "preview_ipfs_hash",
        "type": "core::felt252"
      },
      {
        "kind": "data",
        "name": "updated_price",
        "type": "core::integer::u256"
      },
      {
        "kind": "data",
        "name": "for_sale",
        "type": "core::bool"
      }
    ]
  },
  {
    "kind": "enum",
    "name": "cairofy_contract::contracts::Cairofy::CairofyV0::Event",
    "type": "event",
    "variants": [
      {
        "kind": "flat",
        "name": "PausableEvent",
        "type": "openzeppelin_security::pausable::PausableComponent::Event"
      },
      {
        "kind": "flat",
        "name": "OwnableEvent",
        "type": "openzeppelin_access::ownable::ownable::OwnableComponent::Event"
      },
      {
        "kind": "flat",
        "name": "UpgradeableEvent",
        "type": "openzeppelin_upgrades::upgradeable::UpgradeableComponent::Event"
      },
      {
        "kind": "nested",
        "name": "Song_Registered",
        "type": "cairofy_contract::events::Events::Song_Registered"
      },
      {
        "kind": "nested",
        "name": "SongPriceUpdated",
        "type": "cairofy_contract::events::Events::SongPriceUpdated"
      }
    ]
  }
];

