
import { useState, useEffect } from "react";
import { PublicKey, Keypair } from "@solana/web3.js";
import { Provider, Program, utils } from '@project-serum/anchor';
import { useWallet } from "@solana/wallet-adapter-react";
import { fetchMembershipCardMintForWallet } from "../../api/membership";
import { getForumProgram, getProvider, getMintConfig } from '../../api/config'
import { mintMembership } from "../../api/membership";
import { toDisplayString } from "../../utils"
import { ForumInfo, Membership } from "./Forum";
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
    memberCardMint: PublicKey | undefined,
    setMemberCardMint: (cardMint: PublicKey | undefined) => void,
    isEligibleToPost: boolean,
    membership: Membership | undefined,
    forumInfo: ForumInfo | undefined,
    cardTokenAccount: PublicKey | undefined,
    didSubmitNewPost: () => void,
}

function MembershipHeader(props: Props) {
    let wallet = useWallet();
    let program = getForumProgram(wallet);
    let [postBody, setPostBody] = useState('');
    let [postLink, setPostLink] = useState('');

    const didPressNewPost = async () => {
        if (wallet.publicKey && props.memberCardMint && props.membership && props.forumInfo && props.cardTokenAccount) {
            let program = getForumProgram(wallet);
            const tx = await program.rpc.newPost(postBody, postLink, {
                accounts: {
                    authority: wallet.publicKey,
                    member: props.membership.publicKey,
                    forum: props.forumInfo.publicKey,
                    post: props.membership.post,
                    cardMint: props.membership.cardMint,
                    cardTokenAccount: props.cardTokenAccount,
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
                mintMembership(mintConfig, getProvider(wallet)).then(() => {
                    fetchMembershipCardMintForWallet(program, wallet.publicKey).then((cardMint) => {
                        props.setMemberCardMint(cardMint);
                        console.log("(use effect) setting isMember to ", cardMint?.toBase58())
                    })
                })
            });
        }
    }


    if (props.memberCardMint) {
        return (
            <div>
                <div>
                    Hello, friend {toDisplayString(props.memberCardMint)}
                </div>
                {props.isEligibleToPost
                    ? <div>
                        u can post
                        <div>
                            <input
                                placeholder="new post"
                                onChange={e => setPostBody(e.target.value)}
                                value={postBody}
                                className="default-input"
                            />
                        </div>
                        <div>
                            <input
                                placeholder="add link"
                                onChange={e => setPostLink(e.target.value)}
                                value={postLink}
                                className="default-input"
                            />
                        </div>
                        <div>
                            <button onClick={didPressNewPost}>post</button>
                        </div>
                    </div>
                    : <div>
                        u can't post
                    </div>
                }
            </div>
        )
    } else {
        return (
            <div>
                <button onClick={didPressMintMembership}>mint membership</button>
            </div>
        )
    }
}
export default MembershipHeader;