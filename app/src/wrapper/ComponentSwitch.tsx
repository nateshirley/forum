import React, { FC, useState, useEffect } from 'react';
import { clusterApiUrl, Connection, ConfirmOptions, Commitment, PublicKey } from '@solana/web3.js';
import { Provider, Wallet, web3 } from '@project-serum/anchor';
import { useWallet } from '@solana/wallet-adapter-react';
import { Route, Switch } from 'react-router-dom';
import Home, { ForumInfo, Membership } from '../components/Forum/Home';
import New from '../components/New'
import PostDetails from '../components/PostDetails';
import { getForumProgram } from '../api/config';
import { getCardTokenAccount, getForumAddress, getLeaderboard } from '../api/addresses';
import { fetchMembershipAccount, fetchMembershipCardMintForWallet } from '../api/membership';
import { numberArrayToString } from '../utils';
import { Post } from '../components/Forum/ActivePosts';
import { fetchedPostAccountToPostObject } from '../api/posts';



const ComponentSwitch: FC = () => {
    const wallet = useWallet();
    const program = getForumProgram(wallet);
    const [forumInfo, setForumInfo] = useState<ForumInfo | undefined>(undefined);
    const [leaderboard, setLeaderboard] = useState<PublicKey | undefined>(undefined);
    const [membership, setMembership] = useState<Membership | undefined>(undefined);
    const [memberCardMint, setMemberCardMint] = useState<PublicKey | undefined>(undefined);
    const [canLike, setCanLike] = useState(false);
    const [canPost, setCanPost] = useState(false);
    const [activeUserPost, setActiveUserPost] = useState<Post | undefined>(undefined);
    const [cardTokenAccount, setCardTokenAccount] = useState<PublicKey | undefined>(undefined);


    useEffect(() => {
        getForumAddress().then(([forum, bump]) => {
            program.account.forum.fetch(forum).then((fetchedInfo) => {
                console.log("setting forum info", fetchedInfo)
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
            console.log("(use effect) setting memberCardMint to ", cardMint?.toBase58())
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
        if (forumInfo && membership) {
            let activeEpoch = forumInfo?.epoch ?? 0;
            program.account.vote.fetch(membership.vote).then((likeAccount) => {
                setCanLike(likeAccount.epoch <= activeEpoch);
            });
            program.account.post.fetch(membership.post).then((postAccount) => {
                setCanPost(postAccount.epoch <= activeEpoch);
                if (postAccount.epoch > activeEpoch && membership) { //they already posted, set the post
                    //console.log(membership.post.toBase58(), " jjjjjjjjj")
                    setActiveUserPost(fetchedPostAccountToPostObject(postAccount, membership.post));
                }
            })
        } else {
            setCanLike(false);
            setCanPost(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [membership, forumInfo]);

    const submitLike = async (post: PublicKey) => {
        if (wallet.publicKey && forumInfo && membership && cardTokenAccount && leaderboard) {
            let tx = await program.rpc.submitVote(1, {
                accounts: {
                    authority: wallet.publicKey,
                    member: membership.publicKey,
                    forum: forumInfo.publicKey,
                    leaderboard: leaderboard,
                    post: post,
                    vote: membership.vote,
                    cardMint: membership.cardMint,
                    cardTokenAccount: cardTokenAccount,
                    //clock: web3.SYSVAR_CLOCK_PUBKEY
                },
            });
            setCanLike(false);
            return tx;
        }
    }


    return (
        <Switch>
            <Route path="/details">
                <PostDetails canLike={false} submitLike={submitLike} />
            </Route>
            <Route path="/new">
                <New />
            </Route>
            <Route path="/" >
                <Home forumInfo={forumInfo} memberCardMint={memberCardMint} membership={membership} leaderboard={leaderboard}
                    cardTokenAccount={cardTokenAccount} canPost={canPost} canLike={canLike} activeUserPost={activeUserPost} setMemberCardMint={setMemberCardMint}
                    setCanPost={setCanPost} submitLike={submitLike} />
            </Route>
        </Switch>
    );

}

export default ComponentSwitch;