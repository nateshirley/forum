import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

const AWARENESS = {
    default: "default", //1
    learnMore: "learnMore", //2
    closed: "closed", //3
};

function DevnetDisclaimer() {
    const history = useHistory();
    const [awareness, setAwareness] = useState(AWARENESS.default);

    const didClickLearnMore = () => {
        setAwareness(AWARENESS.learnMore);
    }
    const didClickClose = () => {
        setAwareness(AWARENESS.closed);
    }
    const showMeHow = () => {
        history.push("/networkchange")
    }
    const whatIsThis = () => {
        history.push("/about")
    }

    const content = () => {
        if (awareness === AWARENESS.default) {
            return (
                <div>
                    PRH is in beta on the solana devnet. all transactions on this internet site are executed via devnet aka they do not spend real sol.&nbsp;
                    <button onClick={didClickLearnMore} className="disclaimer-learn-more">learn more</button>
                </div>
            )
        } else if (awareness === AWARENESS.learnMore) {
            return (
                <div>
                    PRH is in beta on the solana devnet. all transactions on this internet site are executed via devnet aka they do not spend real sol.
                    <br />
                    <br />
                    if u want devnet sol, u can click the airdrop button at the bottom of the page.
                    <br />
                    <br />
                    to see your membership NFT, you'll have to switch your phantom wallet to devnet.&nbsp;<button onClick={showMeHow} className="disclaimer-learn-more">show me how</button>
                    <br />
                    <br />
                    <button onClick={whatIsThis} className="disclaimer-learn-more">what is PRH?</button>
                </div>
            )
        }
        return <div></div>
    }

    if (awareness === AWARENESS.closed) {
        return (
            <div>
            </div>
        )
    } else {
        return (
            <div className="devnet-disclaimer">
                <div className="disclaimer-content-outer">
                    <button onClick={didClickClose} className="disclaimer-x">✕</button>
                    <div className="disclaimer-content">
                        {content()}
                    </div>
                </div>
            </div>
        )
    }

    //

}

export default DevnetDisclaimer;