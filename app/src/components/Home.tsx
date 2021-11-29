import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Keypair, SystemProgram } from '@solana/web3.js';
import { useEffect } from "react";
import { useHistory } from "react-router";
import { ForumInfo } from "../interfaces";

interface Props {
    forumInfo: ForumInfo | undefined,
}

function Home(props: Props) {

    const history = useHistory();



    return (
        <div>Home</div>
    );
}
export default Home;