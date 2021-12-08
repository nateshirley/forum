import { Link } from "react-router-dom";

function About() {


    return (
        <div className="component-parent">
            prh
            <br />
            <br />
            <br />
            <br />
            <div className="about-div">
                a ParisRadioHour is a set of ideas about music/crypto.
                <br />
                <br />
                each week, a new PRH is written on chain—by the community—and then auctioned off by the protocol
                <br />
                <br />
                auction proceeds enter the community's treasury, where they are used to further the PRH
                <br />
                <br />
                every PRH is created, issued, and auctioned permissionlessly. all data comes and goes directly from the solana blockchain
                <br />
                <br />
                ---
                <br />
                p.s. community members can submit one post and one like per week. PRH is currently in beta on the solana devnet. try it <Link to="/">here</Link>
            </div>

        </div>
    );
}
export default About