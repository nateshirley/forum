import { fetchAllActivePostsSortedByScore, sortByTime } from "../../api/posts";
import { useState, useEffect } from "react";
import { getForumProgram, getProvider } from "../../api/config";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { tokenLink, timeSince, toDisplayString, toPostHref } from "../../utils";
import { ForumInfo, Post } from "../../interfaces";
import likeIcon from "../../assets/likeIcon.svg"
import likeIconFill from "../../assets/likeIconFill.svg"
import toast, { Toaster } from "react-hot-toast";
import { useHistory } from "react-router-dom";

interface Props {
    forumInfo: ForumInfo | undefined,
    memberCardMint: PublicKey | undefined,
    canLike: boolean,
    refresh: number,
    submitLike: (post: PublicKey) => Promise<string | undefined>,
    sort: string,
}



function ActivePosts(props: Props) {
    const wallet = useWallet()
    const [activePosts, setActivePosts] = useState<undefined | Post[]>(undefined);
    const history = useHistory();
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

    useEffect(() => {
        if (props.sort === "top") {
            if (activePosts) {
                setActivePostsByScore([...activePosts])
            }
        } else if (props.sort === "recent") {
            if (activePosts) {
                setActivePosts([...activePosts].sort((a, b) => {
                    return b.timestamp - a.timestamp;
                }));
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.sort])

    const setActivePostsByScore = (posts: Post[]) => {
        setActivePosts(posts.sort((a, b) => {
            return b.sessionScore - a.sessionScore;
        }));
    }

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
                setActivePostsByScore(posts);
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

    const didClickPostOuter = (postAddress: PublicKey) => {
        history.push("/post/" + postAddress.toBase58())
    }


    let postCards = () => {
        if (activePosts && activePosts.length > 0) {
            return activePosts.map((post, index) => {
                return (
                    <div key={index} className="post-outer active" onClick={() => didClickPostOuter(post.publicKey)}>
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
                        </div>
                        <div className="post-body">
                            {post.body}
                        </div>
                        <div className="post-link">
                            <a href={toPostHref(post.link)} target="_blank" className="post-a"
                                rel="noreferrer noopener">{post.link}</a>
                        </div>
                        {props.canLike
                            ? (
                                <button className="like-button" onClick={() => didPressLike(post.publicKey, index)}>
                                    <img src={likeIcon} className="like-icon-active" alt="like" />
                                    {post.sessionScore}
                                </button>
                            )
                            : (
                                <div className="like-button-cant">
                                    <img src={likeIconFill} className="like-icon-active" alt="like" />
                                    {post.sessionScore}
                                </div>
                            )
                        }

                    </div>
                )
            })
        } else {
            return (<div style={{ color: "rgb(0,0,0,0.4" }}>make the first post</div>)
        }
    }


    return (
        <div >
            <div><Toaster /></div>
            {postCards()}
        </div>
    );
}

export default ActivePosts;