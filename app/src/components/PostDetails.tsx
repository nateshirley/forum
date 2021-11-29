import { useEffect, useState } from "react";
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { useHistory } from "react-router";
import qs from "qs";
import { getForumProgram } from "../api/config";
import { numberArrayToString } from "../utils";
import { fetchMembershipAccount, fetchMembershipCardMintForWallet } from "../api/membership";
import { fetchedPostAccountToPostObject } from "../api/posts";
import { Post } from "../interfaces";

interface Props {
    canLike: boolean,
    submitLike: (post: PublicKey) => Promise<string | undefined>
}

function PostDetails(props: Props) {
    const wallet = useWallet()
    const program = getForumProgram(wallet)
    const history = useHistory();
    const [postInfo, setPostInfo] = useState<Post | undefined>(undefined);

    //look up any post account 
    //this parses the url on first render and does a search if it finds a valid key in url params
    useEffect(() => {
        const filterParams = history.location.search.substr(1);
        const filtersFromParams = qs.parse(filterParams);
        if (filtersFromParams.key) {
            parseUri(decodeURI(String(filtersFromParams.key)));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const parseUri = (uri: String) => {
        try {
            let publicKey = new PublicKey(uri);
            queryForPostAtAddress(publicKey).then((result) => {
                if (!result) {
                    queryForPostFromWallet(publicKey);
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

    const queryForPostFromWallet = async (address: PublicKey) => {
        fetchMembershipCardMintForWallet(program, address).then((cardMint) => {
            if (cardMint) {
                fetchMembershipAccount(program, cardMint).then((membership) => {
                    if (membership) {
                        console.log("member post ", membership.post)
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
                <div>
                    {postInfo.body}
                </div>
                <div>
                    {postInfo.sessionScore}
                </div>
                <div>
                    <a href={postInfo.link}>{postInfo.link}</a>
                </div>
                <div>
                    {props.canLike
                        ? <button onClick={() => didPressLike(postInfo.publicKey)}>like</button>
                        : <div>not able</div>
                    }
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