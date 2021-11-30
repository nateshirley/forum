import { useEffect, useState } from "react";
import { PublicKey, Keypair, SystemProgram, SYSVAR_CLOCK_PUBKEY } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, Token, MintLayout } from "@solana/spl-token";
import { getArtifactAddress, getArtifactAttributionAddress, getArtifactAuctionAddress, getForumAuthority, getLeaderboard } from "../../api/addresses";
import { useWallet } from "@solana/wallet-adapter-react";
import { getForumProgram } from "../../api/config";
import { useHistory, useLocation } from "react-router";
import { Artifact as ArtifactInterface, ArtifactAuction, Pda } from "../../interfaces";
import qs from "qs";
import { numberArrayToString } from "../../utils";

interface Props {
    artifactAuction: ArtifactAuction | undefined,
}
//set this up to show the info for session with id param
function Artifact(props: Props) {
    const [artifactObject, setArtifactObject] = useState<ArtifactInterface | undefined>(undefined);
    const [session, setSession] = useState<undefined | number>(undefined);
    const location = useLocation();
    const history = useHistory();
    const artifactAuction = props.artifactAuction;
    const wallet = useWallet()
    const program = getForumProgram(wallet);

    useEffect(() => {
        let sesh = location.pathname.split("/session/");
        if (sesh.length === 2) {
            setSession(parseInt(sesh[1]))
        }
    }, [location])

    useEffect(() => {
        fetchArtifact();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session])

    const fetchArtifact = () => {
        if (session) {
            getArtifactAddress(
                session
            ).then(([artifactAddress, bump]) => {
                console.log(artifactAddress.toBase58())
                program.account.artifact.fetch(artifactAddress).then((fetchedArtifact) => {
                    let posts: any = fetchedArtifact.posts;
                    let artifactPosts = posts.map((post: any) => {
                        return {
                            cardMint: post.cardMint,
                            body: numberArrayToString(post.body),
                            link: numberArrayToString(post.link),
                            score: post.score
                        }
                    });
                    setArtifactObject({
                        address: artifactAddress,
                        session: fetchedArtifact.session,
                        cardMint: fetchedArtifact.cardMint,
                        posts: artifactPosts,
                        bump: fetchedArtifact.bump
                    })
                    console.log({
                        address: artifactAddress,
                        session: fetchedArtifact.session,
                        cardMint: fetchedArtifact.cardMint,
                        posts: artifactPosts,
                        bump: fetchedArtifact.bump
                    });
                }).catch((e) => {
                    console.log("failed to get the artifact object")
                })
            });
        }
    }

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

    const clickedLeft = () => {
        if (session && session > 1) {
            history.push("/session/" + (session - 1));
        }
    }
    const clickedRight = () => {
        if (session && artifactAuction) {
            if (session + 1 < artifactAuction.session) {
                history.push("/session/" + (session + 1));
            } else {
                history.push("");
            }
        }
    }
    let arrowButtons = (
        <div>
            <button onClick={clickedLeft}>←</button> <button onClick={clickedRight}>→</button>
        </div>
    );

    return (
        <div className="component-parent">
            {arrowButtons}
            <div>Session {session}</div>
            <div>old artifact</div>
            <div>{artifactElement}</div>
        </div>

    )
}

export default Artifact;