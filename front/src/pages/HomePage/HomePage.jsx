import { Link } from "react-router-dom";
import "./HomePage.css";
import img from "../../assets/img_accueil.png"

export default function HomePage() {
  return (
    <div className="container-homepage">
       <h1> Prévision covid dans le monde </h1>

       <img 
  src= {img}
  alt="Description de l'image" 
  a={true} // <- Voici l'erreur
/>
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