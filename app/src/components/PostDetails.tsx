import { useEffect, useState } from "react";
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { useHistory } from "react-router";
import qs from "qs";
import { getForumProgram } from "../api/config";
<<<<<<< HEAD
import { numberArrayToString } from "../utils";
=======
import { numberArrayToString, tokenLink, timeSince, toDisplayString, toPostHref } from "../utils";
>>>>>>> metadata
import { fetchMembershipAccount, fetchMembershipCardMintForWallet } from "../api/membership";
import { fetchedPostAccountToPostObject } from "../api/posts";
import { Post } from "../interfaces";
import { useLocation } from "react-router-dom";

interface Props {
    canLike: boolean,
    submitLike: (post: PublicKey) => Promise<string | undefined>
}

function PostDetails(props: Props) {
    const wallet = useWallet()
    const program = getForumProgram(wallet)
    const history = useHistory();
    const [postInfo, setPostInfo] = useState<Post | undefined>(undefined);
    const location = useLocation();

    //look up any post account 
    //this parses the url on first render and does a search if it finds a valid key in url params

    useEffect(() => {
        let postAccount = location.pathname.split("/post/")
        if (postAccount.length === 2) {
            parseUri(postAccount[1]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location])

    const parseUri = (uri: String) => {
        try {
            let publicKey = new PublicKey(uri);
            console.log("making a q")
            queryForPostAtAddress(publicKey).then((result) => {
                if (!result) {
                    queryForPostFromCardMint(publicKey).then((result) => {
                        if (!result) {
                            queryForPostFromWallet(publicKey);
                        }
                    });
                }
            })
        } catch (e) {
            console.log("uri doesn't parse to pk")
        }
    }

    const queryForPostAtAddress = async (postAddress: PublicKey) => {
        try {
            let postAccount = await program.account.post.fetch(postAddress);
            setPostInfo(fetchedPostAccountToPostObject(postAccount, postAddress));
            return true;
        } catch (e) {
            return false;
        }
    }

    const queryForPostFromCardMint = async (cardMint: PublicKey): Promise<boolean> => {
        return fetchMembershipAccount(program, cardMint).then((membership) => {
            if (membership) {
                return queryForPostAtAddress(membership.post);
            } else {
                return false;
            }
        }).catch((e) => {
            return false;
        });
    }
    const queryForPostFromWallet = async (address: PublicKey) => {
        fetchMembershipCardMintForWallet(program, address).then((cardMint) => {
            if (cardMint) {
                fetchMembershipAccount(program, cardMint).then((membership) => {
                    if (membership) {
                        queryForPostAtAddress(membership.post);
                    }
                })
            }
        });
    }

    const didPressLike = (postAddress: PublicKey) => {
        props.submitLike(postAddress).then((sig) => {
            queryForPostAtAddress(postAddress);
            console.log("did a like with sig: ", sig);
        });
    }

    let postCard;
    if (postInfo) {
        postCard = (
            <div className="post-outer">
<<<<<<< HEAD
                <div>
                    {postInfo.body}
=======
                <div >
                    <a
                        href={tokenLink(post.cardMint)}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="poster-card"
                    >
                        {toDisplayString(post.cardMint, 3)}
                    </a>
                    <span className="dot-time"> · {timeSince(post.timestamp)}</span>
>>>>>>> metadata
                </div>
                <div>
                    {postInfo.sessionScore}
                </div>
<<<<<<< HEAD
                <div>
                    <a href={postInfo.link}>{postInfo.link}</a>
                </div>
                <div>
                    {props.canLike
                        ? <button onClick={() => didPressLike(postInfo.publicKey)}>like</button>
                        : <div>not able</div>
                    }
=======
                <div className="post-link">
                    <a href={toPostHref(post.link)} target="_blank"
                        rel="noreferrer noopener">{post.link}</a>
>>>>>>> metadata
                </div>
            </div>
        )
    }

    return (
        <div className="component-parent">
            post details
            {postCard}
        </div>
    );
}
export default PostDetails;