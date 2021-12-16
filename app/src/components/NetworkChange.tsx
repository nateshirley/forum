import one from "../assets/net/net-one.png"
import two from "../assets/net/net-two.png"
import three from "../assets/net/net-three.png"
import four from "../assets/net/net-four.png"
import "../Global.css"
function NetworkChange() {

    return (
        <div className="component-parent">
            <div className="network-change-images">
                <img src={one} alt="one" className="network-change-image"></img>
                <img src={two} alt="one" className="network-change-image"></img>
                <img src={three} alt="one" className="network-change-image"></img>
                <img src={four} alt="one" className="network-change-image"></img>
            </div>
        </div>
    )

}

export default NetworkChange;