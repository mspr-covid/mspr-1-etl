from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import DictCursor
from typing import Optional
import os
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

# Configuration de la base de données PostgreSQL
DB_CONFIG = {
    "dbname": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT"),
}

# Configuration du JWT
SECRET_KEY = "SalutLesLMSN2024"  # Il est important de garder la clé secrète en sécurité.
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Gestion des mots de passe avec bcrypt via passlib
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Modèles Pydantic pour la validation des données
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# Initialiser l'application FastAPI
app = FastAPI()

# Fonction pour connecter à la base de données
def get_db():
    conn = psycopg2.connect(**DB_CONFIG, cursor_factory=DictCursor)
    try:
        yield conn
    finally:
        conn.close()

# Fonction pour hasher un mot de passe
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# Fonction pour vérifier un mot de passe
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# Fonction pour générer un token d'accès JWT
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Route pour l'inscription d'un utilisateur
@app.post("/register", response_model=Token)
def register(user: UserCreate, db=Depends(get_db)):
    with db.cursor() as cur:
        # Vérifier si l'utilisateur existe déjà dans la base de données
        cur.execute("SELECT * FROM t_users WHERE username = %s OR email = %s", (user.username, user.email))
        if cur.fetchone():
            raise HTTPException(status_code=400, detail="Username ou email déjà utilisé")
        
        # Hasher le mot de passe avant de l'insérer
        hashed_password = hash_password(user.password)

        # Insérer l'utilisateur dans la base de données
        cur.execute(
            "INSERT INTO t_users (username, email, password_hash) VALUES (%s, %s, %s)",
            (user.username, user.email, hashed_password)
        )
        db.commit()

        # Générer un token d'accès pour l'utilisateur
        access_token = create_access_token(data={"sub": user.username})
        return {"access_token": access_token, "token_type": "bearer"}

# Route pour la connexion d'un utilisateur
@app.post("/login", response_model=Token)
def login(user: UserLogin, db=Depends(get_db)):
    with db.cursor() as cur:
        # Vérifier si l'utilisateur existe
        cur.execute("SELECT * FROM t_users WHERE username = %s", (user.username,))
        user_record = cur.fetchone()

        # Vérifier si l'utilisateur existe et si le mot de passe est correct
        if not user_record or not verify_password(user.password, user_record["password_hash"]):
            raise HTTPException(status_code=400, detail="Identifiants incorrects")

        # Générer un token d'accès pour l'utilisateur
        access_token = create_access_token(data={"sub": user.username})
        return {"access_token": access_token, "token_type": "bearer"}

# Route protégée par un token JWT
@app.get("/secure-data")
def read_secure_data(token: str = Depends(create_access_token)):
    # Cette route est protégée par un token JWT, ce qui signifie qu'elle nécessite un token valide pour y accéder.
    return {"message": "Données sécurisées accessibles"}
