use anchor_lang::prelude::*;
use forum::Artifact;
declare_id!("8vXenx89QUMAyDTXvkFAbRu88Pv5pYrjAYcji5n2o2fT");

#[program]
pub mod testartifact {
    use super::*;
    pub fn test_artifact(ctx: Context<TestArtifact>) -> ProgramResult {
        //let artifact = ctx.accounts.artifact.load_init()?;
        Ok(())
    }
}
#[derive(Accounts)]
pub struct TestArtifact<'info> {
    initializer: AccountInfo<'info>,
    #[account(zero)]
    artifact: Loader<'info, Artifact>,
}

// #[account(
//     constraint = artifact_card_mint.decimals == 0,
//     constraint = artifact_card_mint.supply == 0,
//     constraint = artifact_card_mint.freeze_authority.unwrap() == forum_authority.key(),
//     constraint = artifact_card_mint.mint_authority.unwrap() == forum_authority.key(),
// )]
// artifact_card_mint: Account<'info, token::Mint>,
// #[account(
//     seeds = [ARTIFACT_SEED, artifact_card_mint.key().as_ref()],
//     bump = artifact_attribution_bump,
// )]
// artifact_attribution: Account<'info, ArtifactAttribution>,
// #[account(
//     constraint = artifact_auction.session == forum.session,
//     seeds = [ARTIFACT_AUCTION_SEED],
//     bump = artifact_auction.bump,
// )]
// artifact_auction: Account<'info, ArtifactAuction>,
// #[account(
//     seeds = [FORUM_SEED],
//     bump = forum.bump
// )]
// forum: Account<'info, Forum>,
// #[account(
//     seeds = [FORUM_AUTHORITY_SEED],
//     bump = forum_authority.bump,
// )]
// forum_authority: Account<'info, ForumAuthority>,
// leaderboard: Loader<'info, Leaderboard>,
// clock: Sysvar<'info, Clock>,
// forum_program: AccountInfo<'info>,
// system_program: Program<'info, System>,
