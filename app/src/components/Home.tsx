import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Keypair, SystemProgram } from '@solana/web3.js';
import { useEffect } from "react";
import { useHistory } from "react-router";
import { ForumInfo } from "../interfaces";
import { isSessionActive } from "../utils";

interface Props {
    forumInfo: ForumInfo | undefined,
}

function Home(props: Props) {

    const history = useHistory();

    useEffect(() => {
        if (props.forumInfo) {
            let isActive = isSessionActive(props.forumInfo.lastDawn);
            if (isActive) { //this won't be historical, only works for active forum
                history.push("forum")
            } else if (!isActive && props.forumInfo.state === 0) {
                history.push("wrap-session")
            } else {
                //send it to the active auction component
                history.push("active-artifact")
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.forumInfo])

    return (
        <div>Home</div>
    );
}
export default Home;