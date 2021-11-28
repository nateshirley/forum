import { useEffect, useState } from "react";
import { PublicKey, Keypair, SystemProgram, SYSVAR_CLOCK_PUBKEY } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, Token, MintLayout } from "@solana/spl-token";
import { getArtifactAddress, getArtifactAttributionAddress, getArtifactAuctionAddress, getForumAuthority, getLeaderboard } from "../../api/addresses";
import { useWallet } from "@solana/wallet-adapter-react";
import { getForumProgram } from "../../api/config";
import { useHistory } from "react-router";
import { ForumInfo, Pda } from "../../interfaces";

interface Props {

}
//set this up to show the info for session with id param
function Artifact(props: Props) {
    return (
        <div className="component-parent">
            <div>old artifact</div>
        </div>

    )
}

export default Artifact;