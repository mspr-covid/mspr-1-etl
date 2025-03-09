import { Link } from "react-router-dom";
import "./HomePage.css"; 

export default function HomePage() {
  return (
    <div>
      <h1>Prévision covid</h1>
      <div className="homepage">
        <Link to="/data">
          <button type="button" className="enter-button">
            Entrer
          </button>
        </Link>
        <Link to="/connection" className="connexion-button">
          Se connecter
        </Link>
      </div>
    </div>
  );
}