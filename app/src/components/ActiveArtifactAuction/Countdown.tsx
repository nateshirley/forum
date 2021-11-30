
import { useEffect, useState } from 'react';
import { displayCountdown, getNow } from '../../utils';

interface Props {
    auctionEndTimestamp: number | undefined
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
        <div>{displayCountdown(secondsRemaining)} left</div>
    )
}
export default Countdown;