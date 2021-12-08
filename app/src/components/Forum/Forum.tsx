import { useWallet } from "@solana/wallet-adapter-react";
import MembershipHeader from './MembershipHeader';
import ConnectWallet from './ConnectWallet';
import ActivePosts from './ActivePosts';
import { useEffect, useState } from 'react';
import { getForumProgram } from '../../api/config';
import { PublicKey } from '@solana/web3.js';
import "../../Global.css";
import { artifactAuctionTime } from "../../utils";
import { ArtifactAuction, ForumInfo, Like, Membership, Post } from "../../interfaces";

/*
a lot of aesthetic stuff
- form validation for post
- sorting posts by score and by time
- show liked post or link to liked post
- and then something to show off previous leaderboards
//4 311 010
done
- make a post details page. just a way to link to a post account for a particular card mint.
    - like literally just post/...id and show the post for that account
    - could add more stuff to it later
    - need to add time to post and figure out how to decode time 
*/


interface Props {
    forumInfo: ForumInfo | undefined,
    artifactAuction: ArtifactAuction | undefined,
    memberCardMint: PublicKey | undefined,
    membership: Membership | undefined,
    leaderboard: PublicKey | undefined,
    cardTokenAccount: PublicKey | undefined,
    canPost: boolean,
    canLike: boolean,
    activeUserPost: Post | undefined,
    activeUserLike: Like | undefined,
    setMemberCardMint: (mint: PublicKey | undefined) => void,
    setCanPost: (value: boolean) => void,
    submitLike: (post: PublicKey) => Promise<string | undefined>
}

function Forum(props: Props) {
    const wallet = useWallet();
    const [postRefresh, doPostRefresh] = useState(0);
    const program = getForumProgram(wallet);

    const didSubmitNewPost = () => {
        props.setCanPost(false);
        doPostRefresh(prev => prev + 1);
    }

    let header;
    if (!wallet.connected) {
        header = <ConnectWallet />
    } else {
        header = <MembershipHeader memberCardMint={props.memberCardMint} setMemberCardMint={props.setMemberCardMint} canPost={props.canPost} canLike={props.canLike}
            membership={props.membership} forumInfo={props.forumInfo} cardTokenAccount={props.cardTokenAccount} didSubmitNewPost={didSubmitNewPost}
            activeUserPost={props.activeUserPost} activeUserLike={props.activeUserLike} artifactAuction={props.artifactAuction} />
    }


    return (
        <div >
            {header}
            <div className="posts-header">POSTS</div>
            <ActivePosts forumInfo={props.forumInfo} canLike={props.canLike}
                refresh={postRefresh} submitLike={props.submitLike} memberCardMint={props.memberCardMint} />
        </div>
    );
}
export default Forum;