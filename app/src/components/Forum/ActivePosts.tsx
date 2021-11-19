import { fetchAllActivePostsDecoded } from "../../api/posts";
import { useState, useEffect } from "react";
import { ForumInfo, Membership } from "./Home";
import { getForumProgram, getProvider } from "../../api/config";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";


interface Props {
    forumInfo: ForumInfo | undefined
    canLike: boolean,
    refresh: number,
    submitLike: (post: PublicKey) => Promise<string | undefined>,
}

export interface Post {
    publicKey: PublicKey,
    cardMint: PublicKey,
    body: string,
    link: string,
    timestamp: number,
    epoch: number,
    epochScore: number,
    allTimeScore: number
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
            fetchAllActivePostsDecoded(props.forumInfo.epoch, provider.connection, program).then((posts) => {
                setActivePosts(posts);
            });
        }
    }
    const didPressLike = async (post: PublicKey, index: number) => {
        const tx = await props.submitLike(post);
        if (activePosts && tx) {
            console.log("successful vote w/ sig: ", tx);
            const posts = [...activePosts];
            posts[index].epochScore += 1;
            posts[index].allTimeScore += 1;
            setActivePosts(posts);
        }
    }

    let postCards;
    if (activePosts) {
        postCards = activePosts.map((post, index) => {
            let date = Date.now() / 1000;
            let secondsSince = date - post.timestamp;
            return (
                <div key={index} className="post-outer">
                    <div>
                        {post.body}
                    </div>
                    <div>
                        {post.epochScore}
                    </div>
                    <div>
                        <a href={post.link}>{post.link}</a>
                    </div>
                    <div>
                        {secondsSince}
                    </div>
                    <div>
                        {props.canLike
                            ? <button onClick={() => didPressLike(post.publicKey, index)}>like</button>
                            : <div>already liked</div>
                        }
                    </div>
                </div>
            )
        })
    }


    return (
        <div >
            {postCards}
        </div>
    );
}

export default ActivePosts;