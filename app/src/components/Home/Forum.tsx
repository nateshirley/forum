import { Link } from 'react-router-dom';
import { useWallet } from "@solana/wallet-adapter-react";

import "../../Global.css";
import MembershipHeader from './MembershipHeader';
import ConnectWallet from './ConnectWallet';
import ActivePosts, { Post } from './ActivePosts';
import { useEffect, useState } from 'react';
import { getForumProgram } from '../../api/config';
import { getCardTokenAccount, getForumAddress, getLeaderboard } from '../../api/addresses';
import BN from 'bn.js';
import { PublicKey } from '@solana/web3.js';
import { fetchMembershipAccount, fetchMembershipCardMintForWallet } from '../../api/membership';
import { numberArrayToString } from '../../utils';


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

function Forum() {
    let wallet = useWallet();
    let program = getForumProgram(wallet);
    let [forumInfo, setForumInfo] = useState<ForumInfo | undefined>(undefined);
    let [memberCardMint, setMemberCardMint] = useState<PublicKey | undefined>(undefined);
    let [membership, setMembership] = useState<Membership | undefined>(undefined);
    let [leaderboard, setLeaderboard] = useState<PublicKey | undefined>(undefined);
    let [cardTokenAccount, setCardTokenAccount] = useState<PublicKey | undefined>(undefined);
    let [canPost, setCanPost] = useState(false);
    let [canLike, setCanLike] = useState(false);
    const [activeUserPost, setActiveUserPost] = useState<Post | undefined>(undefined);
    const [postRefresh, doPostRefresh] = useState(0);


    useEffect(() => {
        getForumAddress().then(([forum, bump]) => {
            program.account.forum.fetch(forum).then((fetchedInfo) => {
                console.log("setting forum info")
                setForumInfo({
                    publicKey: forum,
                    membership: fetchedInfo.membership,
                    epoch: fetchedInfo.epoch,
                    lastReset: fetchedInfo.lastReset,
                    bump: fetchedInfo.bump
                })
            });
        });
        getLeaderboard().then(([leaderboard, bump]) => {
            setLeaderboard(leaderboard);
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    //update member status when wallet is connected/disconnected
    useEffect(() => {
        fetchMembershipCardMintForWallet(program, wallet.publicKey).then((cardMint) => {
            setMemberCardMint(cardMint);
            console.log("(use effect) setting isMember to ", cardMint?.toBase58())
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wallet.connected])

    useEffect(() => {
        if (memberCardMint) {
            fetchMembershipAccount(program, memberCardMint).then((membership) => {
                setMembership(membership);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [memberCardMint])

    useEffect(() => {
        if (wallet.publicKey && memberCardMint) {
            getCardTokenAccount(wallet.publicKey, memberCardMint).then((account) => {
                setCardTokenAccount(account);
            });
        }
    }, [wallet.publicKey, memberCardMint])

    useEffect(() => {
        if (membership && forumInfo) {
            let activeEpoch = forumInfo?.epoch ?? 0;
            program.account.vote.fetch(membership.vote).then((likeAccount) => {
                setCanLike(likeAccount.epoch <= activeEpoch);
            });
            program.account.post.fetch(membership.post).then((postAccount) => {
                setCanPost(postAccount.epoch <= activeEpoch);
                if (postAccount.epoch > activeEpoch && membership) { //they already posted, set the post
                    setActiveUserPost({
                        publicKey: membership.post,
                        cardMint: postAccount.cardMint,
                        body: numberArrayToString(postAccount.body),
                        link: numberArrayToString(postAccount.link),
                        score: postAccount.score,
                        epoch: postAccount.epoch
                    })
                }
            })
        } else {
            setCanLike(false);
            setCanPost(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [membership, forumInfo])

    const didSubmitNewPost = () => {
        setCanPost(false);
        doPostRefresh(prev => prev + 1);
    }
    const didPerformLike = () => {
        setCanLike(false);
    }


    let header;
    if (!wallet.connected) {
        header = <ConnectWallet />
    } else {
        header = <MembershipHeader memberCardMint={memberCardMint} setMemberCardMint={setMemberCardMint} canPost={canPost}
            membership={membership} forumInfo={forumInfo} cardTokenAccount={cardTokenAccount} didSubmitNewPost={didSubmitNewPost} activeUserPost={activeUserPost} />
    }

    return (
        <div className="component-parent">
            {header}
            <ActivePosts forumInfo={forumInfo} leaderboard={leaderboard} membership={membership}
                cardTokenAccount={cardTokenAccount} canLike={canLike} refresh={postRefresh} didPerformLike={didPerformLike} />
        </div>
    );
}

export default Forum;