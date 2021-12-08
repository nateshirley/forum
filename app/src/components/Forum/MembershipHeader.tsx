
import { useState, useEffect } from "react";
import { PublicKey, Keypair, SYSVAR_CLOCK_PUBKEY } from "@solana/web3.js";
import { Provider, Program, utils } from '@project-serum/anchor';
import { useWallet } from "@solana/wallet-adapter-react";
import { fetchMembershipCardMintForWallet, getMintConfig } from "../../api/membership";
import { getForumProgram, getProvider } from '../../api/config'
import { mintMembership } from "../../api/membership";
import { toDisplayString } from "../../utils"
import { ArtifactAuction, AUCTION_PHASE, ForumInfo, Like, Membership, Post } from "../../interfaces";
import { useHistory } from "react-router";

/*
if member {
    - show welcome
    - if posted
        show post
    else 
        show dialogue box to post
} else {
    claim membership button
}
*/

interface Props {
    forumInfo: ForumInfo | undefined,
    artifactAuction: ArtifactAuction | undefined,
    auctionPhase: string | undefined,
    memberCardMint: PublicKey | undefined,
    setMemberCardMint: (cardMint: PublicKey | undefined) => void,
    canPost: boolean,
    canLike: boolean,
    membership: Membership | undefined,
    cardTokenAccount: PublicKey | undefined,
    didSubmitNewPost: () => void,
    activeUserPost: Post | undefined,
    activeUserLike: Like | undefined,
}

function MembershipHeader(props: Props) {
    const wallet = useWallet();
    const history = useHistory();
    let program = getForumProgram(wallet);
    const [postBody, setPostBody] = useState('');
    const [postLink, setPostLink] = useState('');

    const didPressNewPost = async () => {
        if (wallet.publicKey && props.memberCardMint && props.membership && props.forumInfo && props.cardTokenAccount && props.artifactAuction) {
            let program = getForumProgram(wallet);
            const tx = await program.rpc.newPost(postBody, postLink, {
                accounts: {
                    authority: wallet.publicKey,
                    membership: props.membership.publicKey,
                    forum: props.forumInfo.publicKey,
                    artifactAuction: props.artifactAuction.address,
                    post: props.membership.post,
                    cardMint: props.membership.cardMint,
                    cardTokenAccount: props.cardTokenAccount,
                    clock: SYSVAR_CLOCK_PUBKEY,
                },
            });
            console.log("submitted post w/ sig: ", tx)
            setPostBody('');
            setPostLink('');
            props.didSubmitNewPost();
        }
    }


    const didPressMintMembership = () => {
        if (wallet.publicKey) {
            getMintConfig(wallet.publicKey).then((mintConfig) => {
                mintMembership(mintConfig, getProvider(wallet)).then((sig) => {
                    console.log("minted tx", sig);
                    fetchMembershipCardMintForWallet(program, wallet.publicKey).then((cardMint) => {
                        props.setMemberCardMint(cardMint);
                        console.log("(use effect) setting isMember to ", cardMint?.toBase58())
                    })
                })
            });
        }
    }
    const onLinkKeyPress = (event: any) => {
        if (event.key === "Enter") {
            didPressNewPost()
        }
    }


    const membershipExplorerLink = (toPubkey: PublicKey, className: string, sliceLength?: number) => {
        //https://explorer.solana.com/address/Fs95oxtjcUdVqo6Zg1JJZ8orq3eGF8qF8cxdKeunD7U1?cluster=devnet
        let slice = sliceLength ? sliceLength : 3
        let link = `https://solscan.io/token/${toPubkey.toBase58()}`
        return (
            <a href={link} target="_blank" rel="noreferrer noopener" className={className}>({toDisplayString(toPubkey, slice)})</a>
        )
    }


    const didPressYourPost = () => {
        if (props.activeUserPost) {
            history.push("/post/" + props.activeUserPost.publicKey.toBase58());
        }
    }
    const didPressYourLike = () => {
        if (props.activeUserLike) {
            history.push("/post/" + props.activeUserLike.votedForCardMint.toBase58());
        }
    }



    //need to trigger post reload when i post, not working rn
    if (props.memberCardMint) {
        let postElement = () => {
            if (props.canPost) {
                return (
                    <div>
                        <div>
                            <textarea
                                placeholder="what's up..."
                                onChange={e => setPostBody(e.target.value)}
                                value={postBody}
                                className="post-input body"
                            />
                        </div>
                        <div>
                            <input
                                placeholder="add link"
                                onChange={e => setPostLink(e.target.value)}
                                value={postLink}
                                onKeyPress={onLinkKeyPress}
                                className="post-input link"
                            />
                        </div>
                        {
                            postBody.length > 0
                                ? <button onClick={didPressNewPost} className="forum-button post active">post</button>
                                : <button onClick={didPressNewPost} className="forum-button post dead">post</button>
                        }
                    </div>
                );
            } else if (props.auctionPhase === AUCTION_PHASE.needsSettled) {
                return (
                    <div>
                        finalize auction to continue
                    </div>
                )
            } else {
                return (
                    <div>
                        <button onClick={didPressYourPost} className="your-activity">your post →</button>
                    </div>
                )
            }
        };
        let likeElement = () => {
            if (props.canLike) {
                return (
                    <div className="likes-remaining">YOUR LIKE: tbd</div>
                )
            } else if (props.auctionPhase === AUCTION_PHASE.needsSettled) {
                return <div />
            } else {
                return (
                    <div>
                        <button onClick={didPressYourLike} className="your-activity">your like →</button>
                    </div>
                )
            }
        }
        return (
            <div>
                <div className="member-greeting">
                    Hello, friend {membershipExplorerLink(props.memberCardMint, "friend-card-mint")}
                </div>
                {postElement()}
                {likeElement()}
            </div>
        )
    } else {
        return (
            <div >
                <div className="connect-alert">
                    not a member?
                </div>
                <button className="mint-membership-button" onClick={didPressMintMembership}>
                    mint membership
                </button>
            </div>
        )
    }
}
export default MembershipHeader;