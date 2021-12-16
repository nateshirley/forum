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
                Paris Radio Hour is a music forum on solana.
                <br />
                <br />
                each week, a new PRH is created on chain—by the community—and then auctioned off by the protocol.
                <br />
                <br />
                auction proceeds enter the community's treasury, where they are used to further the PRH
                <br />
                <br />
                every PRH is created, issued, and auctioned permissionlessly. all forum state comes and goes directly from the solana blockchain
                <br />
                <br />
                ---
                <br />
                p.s. community members can submit one post and one like per week. the top 10 posts from each week are included in the historical PRH. the PRH is currently in beta on the solana devnet. try it <Link to="/">here</Link>
            </div>

        </div>
    );
}
export default About