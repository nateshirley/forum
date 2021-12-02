
import { useEffect, useState } from 'react';
import { getNow } from '../../utils';

interface Props {
    auctionEndTimestamp: number | undefined
}

const displayCountdown = (seconds: number) => {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600 * 24));
    var h = Math.floor((seconds % (3600 * 24)) / 3600);
    var m = Math.floor((seconds % 3600) / 60);
    var s = Math.floor(seconds % 60);

    var dEl = timeElement(d, "d");
    var hEl = timeElement(h, "h");
    var mEl = timeElement(m, "m");
    var sEl = timeElement(s, "s");
    //return dDisplay + hDisplay + mDisplay + sDisplay;
    if (d > 0) {
        return [dEl, hEl, mEl]
    } else {
        return [hEl, mEl, sEl]
    }
};

const timeElement = (number: number, letter: string) => {
    return (
        <span className="auction-number" key={letter}>{number}<span className="auction-secondary-element">{letter}&nbsp;&nbsp;</span></span>
    )
}

function Countdown(props: Props) {
    const [secondsRemaining, setSecondsRemaining] = useState<number>(0);

    useEffect(() => {
        if (props.auctionEndTimestamp) {
            const now = getNow();
            const endTimestamp = props.auctionEndTimestamp;
            let secondsRemaining = endTimestamp - now > 0 ? endTimestamp - now : 0;
            setSecondsRemaining(secondsRemaining)
        }
    }, [props.auctionEndTimestamp])

    useEffect(() => {
        const timerId = setInterval(() => tick(), 1000);
        return () => clearInterval(timerId);
    });
    const tick = () => {
        if (secondsRemaining && secondsRemaining > 0) {
            setSecondsRemaining(secondsRemaining - 1);
        }
    }

    return (
        <div className="auction-number">{displayCountdown(secondsRemaining)}</div>
    )
}
export default Countdown;