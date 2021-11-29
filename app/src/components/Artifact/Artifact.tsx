import { useEffect, useState } from "react";
import { PublicKey, Keypair, SystemProgram, SYSVAR_CLOCK_PUBKEY } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, Token, MintLayout } from "@solana/spl-token";
import { getArtifactAddress, getArtifactAttributionAddress, getArtifactAuctionAddress, getForumAuthority, getLeaderboard } from "../../api/addresses";
import { useWallet } from "@solana/wallet-adapter-react";
import { getForumProgram } from "../../api/config";
import { useHistory } from "react-router";
import { Artifact as ArtifactInterface, Pda } from "../../interfaces";

interface Props {

}
//set this up to show the info for session with id param
function Artifact(props: Props) {
    const [artifactObject, setArtifactObject] = useState<ArtifactInterface | undefined>(undefined);

    //get the artifact object
    //will move this to historical ones. don't need it here
    // useEffect(() => {
    //     if (props.forumInfo) {
    //         getArtifactAddress(
    //             props.forumInfo.session
    //         ).then(([artifactAddress, bump]) => {
    //             console.log(artifactAddress.toBase58())
    //             program.account.artifact.fetch(artifactAddress).then((fetchedArtifact) => {
    //                 let posts: any = fetchedArtifact.posts;
    //                 let artifactPosts = posts.map((post: any) => {
    //                     return {
    //                         cardMint: post.cardMint,
    //                         body: numberArrayToString(post.body),
    //                         link: numberArrayToString(post.link),
    //                         score: post.score
    //                     }
    //                 });
    //                 setArtifact({
    //                     address: artifactAddress,
    //                     session: fetchedArtifact.session,
    //                     cardMint: fetchedArtifact.cardMint,
    //                     posts: artifactPosts,
    //                     bump: fetchedArtifact.bump
    //                 })
    //                 console.log({
    //                     address: artifactAddress,
    //                     session: fetchedArtifact.session,
    //                     cardMint: fetchedArtifact.cardMint,
    //                     posts: artifactPosts,
    //                     bump: fetchedArtifact.bump
    //                 });
    //             }).catch((e) => {
    //                 console.log("failed to get the artifact object")
    //             })
    //         });
    //     }
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [props.forumInfo])

    let artifactElement;
    if (artifactObject) {
        artifactElement = (
            <div>
                this is the artifact
                <div>
                    session: {artifactObject.session}
                </div>
                <div>
                    top post
                    <div>
                        body: {artifactObject.posts[0].body}
                    </div>
                    <div>
                        score: {artifactObject.posts[0].score}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="component-parent">
            <div>old artifact</div>
            <div>{artifactElement}</div>
        </div>

    )
}

export default Artifact;