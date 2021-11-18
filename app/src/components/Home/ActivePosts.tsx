import { fetchAllActivePostsDecoded } from "../../api/posts";
import { useState, useEffect } from "react";
import { ForumInfo } from "./Forum";
import { getForumProgram, getProvider } from "../../api/config";
import { useWallet } from "@solana/wallet-adapter-react";


interface Props {
    forumInfo: ForumInfo | undefined
}

function ActivePosts(props: Props) {
    let wallet = useWallet()
    const provider = getProvider(wallet)
    const program = getForumProgram(wallet);
    let [activePosts, setActivePosts] = useState<undefined | []>(undefined);

    useEffect(() => {
        if (props.forumInfo) {
            fetchAllActivePostsDecoded(props.forumInfo.epoch, provider.connection, program).then((posts) => {
                console.log("fetched posts")
                console.log(posts);

            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.forumInfo])

    return (
        <div >
            Forum
        </div>
    );
}

export default ActivePosts;