module buiry::workspace_ownership {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use std::vector;

    struct WorkspaceOwnership has key, store {
        id: UID,
        owner: address,
        workspace_name: vector<u8>,
        created_at: u64,
        is_active: bool,
    }

    public fun create(name: vector<u8>, ctx: &mut TxContext): WorkspaceOwnership {
        WorkspaceOwnership {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            workspace_name: name,
            created_at: tx_context::epoch(ctx),
            is_active: true,
        }
    }

    public fun transfer_ownership(workspace: &mut WorkspaceOwnership, new_owner: address, ctx: &TxContext) {
        assert!(workspace.owner == tx_context::sender(ctx), 0);
        workspace.owner = new_owner;
    }

    public fun revoke(workspace: &mut WorkspaceOwnership, ctx: &TxContext) {
        assert!(workspace.owner == tx_context::sender(ctx), 0);
        workspace.is_active = false;
    }
}
