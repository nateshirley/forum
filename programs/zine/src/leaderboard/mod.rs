use crate::Post;
use anchor_lang::prelude::*;

pub fn update_posts(
    mut leading_posts: Vec<LeaderboardPost>,
    newly_voted_post: std::cell::RefMut<Post>,
) -> Option<Vec<LeaderboardPost>> {
    let lowest_scoring_index = leading_posts.len() - 1; //4
    let mut insert_marker = lowest_scoring_index; //last index in leaderboard
                                                  //wraparound check
    while (insert_marker < 100)
        && (newly_voted_post.epoch_score > leading_posts[insert_marker].score)
    {
        if newly_voted_post
            .card_mint
            .eq(&leading_posts[insert_marker].card_mint)
        {
            leading_posts.remove(insert_marker);
        } else {
            insert_marker -= 1;
        }
    }
    //insert shifts everything to the right
    if insert_marker != lowest_scoring_index {
        leading_posts.insert(insert_marker + 1, newly_voted_post.to_leaderboard());
        if leading_posts.len() > lowest_scoring_index + 1 {
            leading_posts.pop();
        }
        return Some(leading_posts);
    }
    None
}

#[account(zero_copy)]
pub struct Leaderboard {
    pub epoch: u32,
    pub posts: [LeaderboardPost; 10],
    pub bump: u8,
}
#[zero_copy]
pub struct LeaderboardPost {
    pub card_mint: Pubkey,
    pub body: [u8; 140],
    pub link: [u8; 88],
    pub score: u32,
}
impl Default for LeaderboardPost {
    fn default() -> Self {
        LeaderboardPost {
            card_mint: Pubkey::default(),
            body: [0u8; 140],
            link: [0u8; 88],
            score: 0,
        }
    }
}
