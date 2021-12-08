import { displayCountdown } from "./Countdown";

function ZeroCountdown() {
    return (
        <div className="auction-number">{displayCountdown(0)}</div>
    )
}
export default ZeroCountdown;