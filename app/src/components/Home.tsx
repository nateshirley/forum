import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Keypair, SystemProgram } from '@solana/web3.js';
import { useEffect } from "react";
import { useHistory } from "react-router";
import { ForumInfo, Membership, Post } from "../interfaces";
import Forum from "../components/Forum/Forum";
import ActiveArtifactAuction from '../components/ActiveArtifactAuction/ActiveArtifactAuction';

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

    const history = useHistory();


    /*
    start with active epoch on load
    store epoch in state,
    if epoch < active, load inactive info

    active:
    - active auction
    - membership header
    - active posts

    //push link to old sessions when going back. figure that out later
    inactive - dw about it rn
    - artifact
    - leaderboard?
    */


    return (
        <div className="component-parent">
            <div>Home</div>
            <div>
                <ActiveArtifactAuction forumInfo={props.forumInfo} memberCardMint={props.memberCardMint} membership={props.membership}
                    leaderboard={props.leaderboard} cardTokenAccount={props.cardTokenAccount} activeUserPost={props.activeUserPost} />
            </div>
            <div>
                <Forum forumInfo={props.forumInfo} memberCardMint={props.memberCardMint} membership={props.membership} leaderboard={props.leaderboard}
                    cardTokenAccount={props.cardTokenAccount} canPost={props.canPost} canLike={props.canLike} activeUserPost={props.activeUserPost} setMemberCardMint={props.setMemberCardMint}
                    setCanPost={props.setCanPost} submitLike={props.submitLike} />
            </div>

        </div>
    );
}
export default Home;