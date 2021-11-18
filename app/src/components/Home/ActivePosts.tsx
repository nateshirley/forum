import { fetchAllActivePostsDecoded } from "../../api/posts";
import { useState, useEffect } from "react";
import { ForumInfo, Membership } from "./Forum";
import { getForumProgram, getProvider } from "../../api/config";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";


interface Props {
    forumInfo: ForumInfo | undefined
    leaderboard: PublicKey | undefined,
    membership: Membership | undefined,
    cardTokenAccount: PublicKey | undefined,
}

interface Post {
    publicKey: PublicKey,
    cardMint: PublicKey,
    body: string,
    link: string,
    score: number,
    epoch: number,
}

function ActivePosts(props: Props) {
    let wallet = useWallet()
    const provider = getProvider(wallet)
    const program = getForumProgram(wallet);
    let [activePosts, setActivePosts] = useState<undefined | Post[]>(undefined);
    let forumInfo = props.forumInfo;
    let membership = props.membership;

    useEffect(() => {
        if (props.forumInfo) {
            fetchAllActivePostsDecoded(props.forumInfo.epoch, provider.connection, program).then((posts) => {
                setActivePosts(posts);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.forumInfo])

    const didPressLike = async (post: PublicKey, index: number) => {
        if (wallet.publicKey && forumInfo && membership && props.cardTokenAccount && props.leaderboard) {
            let program = getForumProgram(wallet);
            const tx = await program.rpc.submitVote(1, {
                accounts: {
                    authority: wallet.publicKey,
                    member: membership.publicKey,
                    forum: forumInfo.publicKey,
                    leaderboard: props.leaderboard,
                    post: post,
                    vote: membership.vote,
                    cardMint: membership.card_mint,
                    cardTokenAccount: props.cardTokenAccount,
                },
            });
            console.log("successful vote w/ sig: ", tx);
            if (activePosts) {
                const posts = [...activePosts];
                posts[index].score += 1;
                setActivePosts(posts);
            }
        }
    }

    const postCard = (post: Post, index: number) => {
        return (
            <div key={index} className="post-outer">
                <div>
                    {post.body}
                </div>
                <div>
                    {post.score}
                </div>
                <div>
                    <a href={post.link}>{post.link}</a>
                </div>
                <div>
                    <button onClick={() => didPressLike(post.publicKey, index)}>like</button>
                </div>
            </div>
        )
    }
    let postCards;
    if (activePosts) {
        postCards = activePosts.map((post, index) => {
            return postCard(post, index);
        })
    }


    return (
        <div >
            {postCards}
        </div>
    );
}

export default ActivePosts;