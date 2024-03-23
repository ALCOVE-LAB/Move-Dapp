import Apt from "../assets/apt.svg";
import { Link } from "react-router-dom";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";

export default function Header() {
    return (
        <header style={{ backgroundColor: 'white', opacity: 0.5 , }} >
            <div className="leftH">
                {/* <img src={Logo} alt="logo" className="logo" /> */}
                <Link to="/" className="link">
                    <div className="headerItem">Mint</div>
                </Link>
                <Link to="/portfolio" className="link">
                    <div className="headerItem">Portfolio</div>
                </Link>
            </div>
            <div className="rightH">
                <div className="headerItem">
                    <img src={Apt} alt="apt" className="apt"  style={{ fill: "white" }} />
                    <span style={{ color: 'white'}}>Aptos</span>
                </div>
                <div className="connectButton">
                    <WalletSelector />
                </div>
            </div>
        </header>
    );
}
