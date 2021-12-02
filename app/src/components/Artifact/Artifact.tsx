import { useEffect, useState } from "react";
import { PublicKey, Keypair, SystemProgram, SYSVAR_CLOCK_PUBKEY } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, Token, MintLayout } from "@solana/spl-token";
import { getArtifactAddress, getArtifactAttributionAddress, getArtifactAuctionAddress, getForumAuthority, getLeaderboard } from "../../api/addresses";
import { useWallet } from "@solana/wallet-adapter-react";
import { getForumProgram } from "../../api/config";
import { useHistory, useLocation } from "react-router";
import { Artifact as ArtifactInterface, ArtifactAuction, Pda, ArtifactPost } from "../../interfaces";
import qs from "qs";
import { numberArrayToString, posterLink, toDisplayString } from "../../utils";
import likeIcon from "../../assets/likeIcon.svg"
import { useEasybase } from 'easybase-react';

interface Props {
    artifactAuction: ArtifactAuction | undefined,
}
export interface SessionRecord {
    session: number,
    winningLamports: number,
    wrapTxSignature: string,
}
//set this up to show the info for session with id param
function Artifact(props: Props) {
    const [artifactObject, setArtifactObject] = useState<ArtifactInterface | undefined>(undefined);
    const [artifactOwner, setArtifactOwner] = useState<PublicKey | undefined>(undefined);
    const [session, setSession] = useState<undefined | number>(undefined);
    const [sessionRecord, setSessionRecord] = useState<undefined | SessionRecord>(undefined);
    const location = useLocation();
    const history = useHistory();
    const auction = props.artifactAuction;
    const wallet = useWallet()
    const program = getForumProgram(wallet);
    const { db } = useEasybase();
    const connection = program.provider.connection;
    //other thing i need from here is the current owner

    useEffect(() => {
        let sesh = location.pathname.split("/session/");
        if (sesh.length === 2) {
            let session = parseInt(sesh[1])
            setSession(session)

        }
    }, [location])

    useEffect(() => {
        console.log(sessionRecord);
    }, [sessionRecord])

    useEffect(() => {
        fetchArtifact();
        fetchSessionRecord();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session, db])

    useEffect(() => {
        fetchArtifactOwner();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [artifactObject])

    const fetchArtifactOwner = () => {
        if (artifactObject) {
            connection.getTokenLargestAccounts(artifactObject.cardMint).then((response) => {
                if (response.value.length > 0) {
                    let artifactToken = new Token(
                        connection,
                        artifactObject.cardMint,
                        TOKEN_PROGRAM_ID,
                        Keypair.generate()
                    )
                    artifactToken.getAccountInfo(response.value[0].address).then((response) => {
                        setArtifactOwner(response.owner);
                    })
                }
            })
        }
    }

    const fetchSessionRecord = () => {
        console.log("trying for record", session)
        db("FORUMSESSIONS").return().where({ session: session }).one().then((record: any) => {
            //db("FORUMSESSIONS").return().all().then((record: any) => {
            console.log("record fetched", record)
            setSessionRecord({
                session: record.session,
                winningLamports: record.winninglamports,
                wrapTxSignature: record.wraptxsignature
            })
        }).catch((e) => {
            console.log(e);
        });
    }

    const fetchArtifact = () => {
        if (session) {
            getArtifactAddress(
                session
            ).then(([artifactAddress, bump]) => {
                program.account.artifact.fetch(artifactAddress).then((fetchedArtifact) => {
                    let posts: any = fetchedArtifact.posts;
                    let artifactPosts: ArtifactPost[] = [];
                    posts.forEach((post: any) => {
                        if (!post.cardMint.equals(SystemProgram.programId)) {
                            artifactPosts.push({
                                cardMint: post.cardMint,
                                body: numberArrayToString(post.body),
                                link: numberArrayToString(post.link),
                                score: post.score
                            });
                        }
                    });
                    artifactPosts.sort((a, b) => {
                        return b.score - a.score;
                    });
                    setArtifactObject({
                        address: artifactAddress,
                        session: fetchedArtifact.session,
                        cardMint: fetchedArtifact.cardMint,
                        posts: artifactPosts,
                        bump: fetchedArtifact.bump
                    })
                }).catch((e) => {
                    console.log("failed to get the artifact object")
                })
            });
        }
    }





    const clickedLeft = () => {
        if (session && session > 1) {
            history.push("/session/" + (session - 1));
        }
    }
    const clickedRight = () => {
        if (session && auction) {
            if (session + 1 < auction.session) {
                history.push("/session/" + (session + 1));
            } else {
                history.push("");
            }
        }
    }


    let headerElement;
    if (artifactObject && auction) {
        headerElement = (
            <div>
                <div className="accent-text session-date">{auction.session - artifactObject.session} weeks ago</div>
                <div className="session-header">
                    Session #{artifactObject.session}
                    <button className="session-nav-button left" onClick={clickedLeft}>←</button> <button onClick={clickedRight} className="session-nav-button right">→</button>
                </div>
            </div>
        );
    }

    let postCards;
    if (artifactObject) {
        postCards = artifactObject.posts.map((post, index) => {
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
                    </div>
                    <div className="post-body">
                        {post.body}
                    </div>
                    <div>
                        <a href={post.link}>{post.link}</a>
                    </div>
                    <div >
                        <button className="like-button" ><img src={likeIcon} className="like-icon" alt="like" /> {post.score}</button>
                    </div>
                </div>
            )
        })
    }

    return (
        <div className="component-parent">
            {headerElement}
            {postCards}
        </div>

    )
}

export default Artifact;