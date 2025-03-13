from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
from passlib.context import CryptContext
import os
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

# Modèles de données
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

# Configuration de la base de données
DB_CONFIG = {
    "dbname": os.getenv("DB_NAME", "postgres"),
    "user": os.getenv("DB_USER", "laura"),
    "password": os.getenv("DB_PASSWORD", "password"),
    "host": os.getenv("DB_HOST", "localhost"),
    "port": os.getenv("DB_PORT", "5432"),
}

# Configuration du hachage de mot de passe
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Initialiser l'application
app = FastAPI()

# Configurer CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Route pour créer la table si elle n'existe pas
@app.get("/setup-db")
def setup_db():
    conn = psycopg2.connect(**DB_CONFIG)
    conn.autocommit = True
    try:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS t_users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL
                )
            """)
        return {"status": "success", "message": "Base de données configurée"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        conn.close()

# Route pour l'inscription
@app.post("/api/user/add", status_code=201)
def register_user(user: UserCreate):
    conn = psycopg2.connect(**DB_CONFIG)
    conn.autocommit = True

@app.post("/api/user/login", status_code=200)
def login_user(user: UserLogin):
    conn = psycopg2.connect(**DB_CONFIG)
    conn.autocommit = True
    
    try:
        with conn.cursor() as cur:
            # Vérifier si l'utilisateur existe déjà
            cur.execute("SELECT * FROM t_users WHERE username = %s OR email = %s", 
                       (user.username, user.email))
            if cur.fetchone():
                raise HTTPException(status_code=400, detail="Username ou email déjà utilisé")
            
            # Hasher le mot de passe
            hashed_password = pwd_context.hash(user.password)
            
            # Insérer l'utilisateur
            cur.execute(
                "INSERT INTO t_users (username, email, password_hash) VALUES (%s, %s, %s)",
                (user.username, user.email, hashed_password)
            )
            
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

# Pour lancer le serveur
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)