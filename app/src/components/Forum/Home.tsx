import { useWallet } from "@solana/wallet-adapter-react";
import MembershipHeader from './MembershipHeader';
import ConnectWallet from './ConnectWallet';
import ActivePosts, { Post } from './ActivePosts';
import { useEffect, useState } from 'react';
import { getForumProgram } from '../../api/config';
import BN from 'bn.js';
import { PublicKey } from '@solana/web3.js';
import "../../Global.css";

/*
a lot of aesthetic stuff
- form validation for post
- sorting posts by score and by time
- show liked post or link to liked post
- and then something to show off previous leaderboards

done
- make a post details page. just a way to link to a post account for a particular card mint.
    - like literally just post/...id and show the post for that account
    - could add more stuff to it later
    - need to add time to post and figure out how to decode time 
*/

export interface ForumInfo {
    publicKey: PublicKey,
    membership: number,
    epoch: number,
    lastReset: BN,
    bump: number
}
export interface Membership {
    publicKey: PublicKey,
    authority: PublicKey,
    cardMint: PublicKey,
    post: PublicKey,
    vote: PublicKey,
    id: number,
    bump: number,
}
interface Props {
    forumInfo: ForumInfo | undefined,
    memberCardMint: PublicKey | undefined,
    membership: Membership | undefined,
    leaderboard: PublicKey | undefined,
    cardTokenAccount: PublicKey | undefined,
    canPost: boolean,
    canLike: boolean,
    activeUserPost: Post | undefined,
    setMemberCardMint: (mint: PublicKey | undefined) => void,
    setCanPost: (value: boolean) => void,
    submitLike: (post: PublicKey) => Promise<string | undefined>
}

function Home(props: Props) {
    const wallet = useWallet();
    const [postRefresh, doPostRefresh] = useState(0);

    const didSubmitNewPost = () => {
        props.setCanPost(false);
        doPostRefresh(prev => prev + 1);
    }

    let header;
    if (!wallet.connected) {
        header = <ConnectWallet />
    } else {
        header = <MembershipHeader memberCardMint={props.memberCardMint} setMemberCardMint={props.setMemberCardMint} canPost={props.canPost}
            membership={props.membership} forumInfo={props.forumInfo} cardTokenAccount={props.cardTokenAccount} didSubmitNewPost={didSubmitNewPost} activeUserPost={props.activeUserPost} />
    }

    return (
        <div className="component-parent">
            {header}
            <ActivePosts forumInfo={props.forumInfo} canLike={props.canLike}
                refresh={postRefresh} submitLike={props.submitLike} />
        </div>
    );
}
export default Home;