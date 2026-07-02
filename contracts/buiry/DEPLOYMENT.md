# Buiry — Sui Contract Deployment Record

## Deployment Details

| Field | Value |
|---|---|
| **Network** | Sui Testnet |
| **Package ID** | `0x411d197869a261a42911ac454e063231301c18d0c0f9289f3a4c414db016e60e` |
| **Transaction Digest** | `4E5wH5DhAfwxeVRrbEXU2DntzcyrTvuHbnrRWCGGL3iH` |
| **Deployer Address** | `0x01d65891204c9a6d5f1f6f0f93ceca8952fee2769ce2fdec887183c2624647d3` |
| **Deployed At** | 2026-07-02 |
| **Gas Cost** | 0.0247 SUI (24,729,480 MIST) |
| **Modules** | dataset_listing, marketplace_purchase, revenue_vault, workspace_ownership |

## Modules Deployed

| Module | Purpose |
|---|---|
| `workspace_ownership` | Create, transfer, revoke workspace ownership on-chain |
| `dataset_listing` | Register datasets with category, domain, price, sample size |
| `marketplace_purchase` | Purchase datasets with 10% platform fee split |
| `revenue_vault` | Hold platform fees, admin-only withdrawal |

## How to Interact

### Create a workspace
```bash
sui client call --package 0x411d197869a261a42911ac454e063231301c18d0c0f9289f3a4c414db016e60e \
  --module workspace_ownership \
  --function create \
  --args <name_bytes> \
  --gas-budget 10000000
```

### Create a dataset listing
```bash
sui client call --package 0x411d197869a261a42911ac454e063231301c18d0c0f9289f3a4c414db016e60e \
  --module dataset_listing \
  --function create \
  --args <walrus_blob_id> <category> <domain> <sample_size> \
  --gas-budget 10000000
```

### List on marketplace
```bash
sui client call --package 0x411d197869a261a42911ac454e063231301c18d0c0f9289f3a4c414db016e60e \
  --module dataset_listing \
  --function list_on_marketplace \
  --args <listing_object_id> <price_mist> \
  --gas-budget 10000000
```

## Verification

View on Sui Explorer:
https://suiexplorer.com/object/0x411d197869a261a42911ac454e063231301c18d0c0f9289f3a4c414db016e60e?network=testnet

---

*Deployed: 2026-07-02*
