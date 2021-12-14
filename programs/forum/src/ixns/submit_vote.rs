use crate::structs::core::{LeaderboardPost, Post};
use anchor_lang::prelude::*;

pub fn get_new_leading_posts(
    leading_posts: Vec<LeaderboardPost>,
    newly_voted_post: std::cell::RefMut<Post>,
) -> Option<[LeaderboardPost; 10]> {
    if let Some(mut new_leading_posts) = new_leading_posts_vec(leading_posts, newly_voted_post) {
        let mut leaders = [LeaderboardPost::default(); 10];
        for i in (0..=(new_leading_posts.len() - 1)).rev() {
            leaders[i] = new_leading_posts.pop().unwrap();
        }
        return Some(leaders);
    } else {
        None
    }
}

pub fn new_leading_posts_vec(
    mut leading_posts: Vec<LeaderboardPost>,
    newly_voted_post: std::cell::RefMut<Post>,
) -> Option<Vec<LeaderboardPost>> {
    let lowest_scoring_index = leading_posts.len() - 1;
    let mut insert_marker = lowest_scoring_index; //last index in leaderboard
                                                  //wraparound check
    while (insert_marker < 100)
        && (newly_voted_post.session_score > leading_posts[insert_marker].score)
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
