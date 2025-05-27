import os
import jwt
import psycopg2
from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from typing import Generator
from datetime import datetime, timedelta, UTC
from dotenv import load_dotenv
from database.Database import Database

# Charger les variables d'environnement
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Initialisation de FastAPI
app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Bienvenue sur l'API COVID"}


# Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["*"],
)

# Configuration du hachage des mots de passe
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Gestion des tokens
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

# Modèles Pydantic
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class CovidEntry(BaseModel):
    country: str
    continent: str
    who_region: str
    population: int
    total_cases: int
    total_deaths: int
    total_recovered: int
    serious_critical: int
    total_tests: int

# Connexion à la BDD
def get_db() -> Generator:
    db = Database()
    try:
        yield db.get_cursor()
    finally:
        db.close()

# Générer un token JWT
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.now(UTC) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Vérifier le token JWT
def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload["sub"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expiré")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token invalide")

# Route pour inscrire un utilisateur
@app.post("/api/user", status_code=201)
def register_user(user: UserCreate, cursor=Depends(get_db)):
    try:
        cursor.execute("SELECT id FROM t_users WHERE username = %s OR email = %s", (user.username, user.email))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Nom d'utilisateur ou email incorrect")

        hashed_password = pwd_context.hash(user.password)
        cursor.execute("INSERT INTO t_users (username, email, password_hash) VALUES (%s, %s, %s)",
                       (user.username, user.email, hashed_password))
        return {"message": "Utilisateur créé avec succès"}
    except psycopg2.Error as e:
        if e.pgcode == "23505":
            raise HTTPException(status_code=400, detail="Nom d'utilisateur ou email incorrect")
        raise HTTPException(status_code=500, detail="Erreur serveur")

# Route pour se connecter et récupérer un token
@app.post("/api/login", status_code=200)
def login_user(form_data: OAuth2PasswordRequestForm = Depends(), cursor=Depends(get_db)):
    try:
        cursor.execute("SELECT id, password_hash FROM t_users WHERE username = %s", (form_data.username,))
        user = cursor.fetchone()
        if not user or not pwd_context.verify(form_data.password, user["password_hash"]):
            raise HTTPException(status_code=400, detail="Identifiants invalides")

        access_token = create_access_token(data={"sub": form_data.username})
        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Route GET pour récupérer toutes les entrées (nécessite authentification)
@app.get("/covid")
def get_all_entries(cursor=Depends(get_db), current_user: str = Depends(get_current_user)):
    cursor.execute("""
        SELECT c.country, c.continent, c.who_region, c.population, 
               h.total_cases, h.total_deaths, h.total_recovered, h.serious_critical, 
               t.total_tests 
        FROM countries c
        LEFT JOIN health_statistics h ON c.country = h.country
        LEFT JOIN testing_statistics t ON c.country = t.country
    """)
    data = cursor.fetchall()

    if not data:
        raise HTTPException(status_code=404, detail="No data found")

    return {"data": [dict(row) for row in data]}


# Route GET pour récupérer une entrée par pays
@app.get("/covid/{country}")
def get_entry_by_country(country: str, cursor=Depends(get_db), current_user: str = Depends(get_current_user)):
    cursor.execute("""
        SELECT c.country, c.continent, c.who_region, c.population, 
               h.total_cases, h.total_deaths, h.total_recovered, h.serious_critical, 
               t.total_tests 
        FROM countries c
        LEFT JOIN health_statistics h ON c.country = h.country
        LEFT JOIN t_tests t ON c.country = t.country
        WHERE c.country = %s
    """, (country,))
    data = cursor.fetchone()

    if not data:
        raise HTTPException(status_code=404, detail="Country not found")

    return {"data": dict(data)}

# Route POST pour ajouter une entrée (nécessite authentification)
@app.post("/covid")
def add_entry(entry: CovidEntry, cursor=Depends(get_db), current_user: str = Depends(get_current_user)):
    try:
        cursor.execute("BEGIN;")
        cursor.execute("""
            INSERT INTO countries (country, continent, who_region, population)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (country) DO UPDATE 
            SET continent = EXCLUDED.continent,
                who_region = EXCLUDED.who_region,
                population = EXCLUDED.population
        """, (entry.country, entry.continent, entry.who_region, entry.population))

        cursor.execute("""
            INSERT INTO health_statistics (country, total_cases, total_deaths, total_recovered, serious_critical)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (country) DO UPDATE 
            SET total_cases = EXCLUDED.total_cases,
                total_deaths = EXCLUDED.total_deaths,
                total_recovered = EXCLUDED.total_recovered,
                serious_critical = EXCLUDED.serious_critical
        """, (entry.country, entry.total_cases, entry.total_deaths, entry.total_recovered, entry.serious_critical))

        cursor.execute("""
            INSERT INTO t_tests (country, total_tests)
            VALUES (%s, %s)
            ON CONFLICT (country) DO UPDATE 
            SET total_tests = EXCLUDED.total_tests
        """, (entry.country, entry.total_tests))

        cursor.connection.commit()
    except Exception as e:
        cursor.connection.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    return {"message": "Entry added successfully"}

# Route PUT pour mettre à jour une entrée complète
@app.put("/covid/{country}")
def update_entry(country: str, entry: CovidEntry, cursor=Depends(get_db), current_user: str = Depends(get_current_user)):
    cursor.execute("""
        UPDATE countries SET continent = %s, who_region = %s, population = %s WHERE country = %s
    """, (entry.continent, entry.who_region, entry.population, country))

    cursor.execute("""
        UPDATE health_statistics SET total_cases = %s, total_deaths = %s, total_recovered = %s, serious_critical = %s WHERE country = %s
    """, (entry.total_cases, entry.total_deaths, entry.total_recovered, entry.serious_critical, country))

    cursor.execute("""
        UPDATE t_tests SET total_tests = %s WHERE country = %s
    """, (entry.total_tests, country))

    cursor.connection.commit()
    return {"message": "Entry updated successfully"}

# Route PATCH pour modifier partiellement une entrée
@app.patch("/covid/{country}")
def partial_update_entry(country: str, entry: dict, cursor=Depends(get_db), current_user: str = Depends(get_current_user)):
    for key, value in entry.items():
        if key in ["continent", "who_region", "population"]:
            cursor.execute(f"UPDATE countries SET {key} = %s WHERE country = %s", (value, country))
        elif key in ["total_cases", "total_deaths", "total_recovered", "serious_critical"]:
            cursor.execute(f"UPDATE health_statistics SET {key} = %s WHERE country = %s", (value, country))
        elif key == "total_tests":
            cursor.execute("UPDATE t_tests SET total_tests = %s WHERE country = %s", (value, country))
    
    cursor.connection.commit()
    return {"message": "Entry partially updated successfully"}

# Route DELETE pour supprimer une entrée
@app.delete("/covid/{country}")
def delete_entry(country: str, cursor=Depends(get_db), current_user: str = Depends(get_current_user)):
    cursor.execute("DELETE FROM t_tests WHERE country = %s", (country,))
    cursor.execute("DELETE FROM health_statistics WHERE country = %s", (country,))
    cursor.execute("DELETE FROM countries WHERE country = %s", (country,))
    cursor.connection.commit()
    return {"message": "Entry deleted successfully"}
