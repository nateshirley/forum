import { fetchAllActivePostsSortedByScore } from "../../api/posts";
import { useState, useEffect } from "react";
import { getForumProgram, getProvider } from "../../api/config";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { getNow, posterLink, timeSince, toDisplayString } from "../../utils";
import { ForumInfo, Post } from "../../interfaces";
import likeIcon from "../../assets/likeIcon.svg"
import toast, { Toaster } from "react-hot-toast";

interface Props {
    forumInfo: ForumInfo | undefined,
    memberCardMint: PublicKey | undefined,
    canLike: boolean,
    refresh: number,
    submitLike: (post: PublicKey) => Promise<string | undefined>,
}



function ActivePosts(props: Props) {
    const wallet = useWallet()
    const [activePosts, setActivePosts] = useState<undefined | Post[]>(undefined);
    let provider = getProvider(wallet)
    let program = getForumProgram(wallet);

    useEffect(() => {
        performRefresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.forumInfo])

    useEffect(() => {
        if (props.refresh > 0) {
            performRefresh();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.refresh]);

    const performRefresh = () => {
        if (props.forumInfo) {
            fetchAllActivePostsSortedByScore(props.forumInfo.session, provider.connection, program).then((posts) => {
                setActivePosts(posts);
            });
        }
    }
    const didPressLike = async (post: PublicKey, index: number) => {
        if (props.canLike) {
            const tx = await props.submitLike(post);
            if (activePosts && tx) {
                console.log("successful vote w/ sig: ", tx);
                const posts = [...activePosts];
                posts[index].sessionScore += 1;
                posts[index].allTimeScore += 1;
                setActivePosts(posts);
            }
        } else if (!wallet.connected) {
            toast('wallet not connected', {
                icon: '🪙',
            });
        } else if (!props.memberCardMint) {
            toast('only members can like', {
                icon: '🤷‍♂️',
            });
        } else {
            toast('u already submitted a like this session', {
                icon: '👀',
            });
        }

    }



    let postCards;
    if (activePosts) {
        postCards = activePosts.map((post, index) => {
            return (
                <div key={index} className="post-outer">
                    <div >
                        <a
                            href={posterLink(post.cardMint)}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="poster-card"
                        >
                            {toDisplayString(post.cardMint, 3)}
                        </a>
                        <span className="dot-time"> · {timeSince(post.timestamp)}</span>
                    </div>
                    <div className="post-body">
                        {post.body}
                    </div>
                    <div>
                        <a href={post.link}>{post.link}</a>
                    </div>
                    <div >
                        <button className="like-button" onClick={() => didPressLike(post.publicKey, index)}><img src={likeIcon} className="like-icon" alt="like" /> {post.sessionScore}</button>
                    </div>
                </div>
            )
        })
    }


    return (
        <div >
            <div><Toaster /></div>
            {postCards}
        </div>
    );
}

export default ActivePosts;