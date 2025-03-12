import { Link } from "react-router-dom";
import "./HomePage.css";
import Logo from "../../assets/covid-stat.mp4"

export default function HomePage() {
  return (
    <div className="container-homepage">
       <h1> Prévision covid dans le monde </h1>

      <video src={Logo} type="video/mp4" alt="c'est le logo qui est légèrement animé" a >
      </video>
      <div className="homepage">
        <Link to="/connection">
          <button type="button" className="connexion-button">
            Entrer
          </button>
        </Link>
      </div>
    </div>
  );
}