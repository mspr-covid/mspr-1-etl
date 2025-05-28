from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import RedirectResponse
from ws.business_layer.covid_entry_validator import CovidEntryValidator
from .models.model import CovidEntryPatch

from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from typing import Generator
import os
import jwt
from datetime import datetime, timedelta, UTC
from dotenv import load_dotenv
from database.Database import Database
import psycopg2



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
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
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
def get_db():
    db = Database()
    cursor = db.get_cursor()
    try:
        yield cursor
        db.connection.commit() 
    except Exception:
        db.connection.rollback()
        raise
    finally:
        cursor.close()
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
        LEFT JOIN health_statistics h ON c.id = h.country_id
        LEFT JOIN testing_statistics t ON c.id = t.country_id
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
        LEFT JOIN health_statistics h ON c.id = h.country_id
        LEFT JOIN testing_statistics t ON c.id = t.country_id
        WHERE c.country = %s
    """, (country,))
    data = cursor.fetchone()

    if not data:
        raise HTTPException(status_code=404, detail=f"Aucune donnée trouvée pour le pays '{country}'")

    return {
        "message": f"Données récupérées avec succès pour le pays '{country}'",
        "data": dict(data)
    }


# Route POST pour ajouter une entrée (nécessite authentification)
@app.post("/covid")
def add_entry(entry: CovidEntry, cursor=Depends(get_db), current_user: str = Depends(get_current_user)):
    
    CovidEntryValidator.validate_non_negative_fields(entry)
    try:
        cursor.execute("BEGIN;")

        # Insert or update country
        cursor.execute("""
            INSERT INTO countries (country, continent, who_region, population)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (country) DO UPDATE 
            SET continent = EXCLUDED.continent,
                who_region = EXCLUDED.who_region,
                population = EXCLUDED.population
            RETURNING id;
        """, (entry.country, entry.continent, entry.who_region, entry.population))

        country_id_row = cursor.fetchone()
        if country_id_row is None:
            cursor.execute("SELECT id FROM countries WHERE country = %s;", (entry.country,))
            country_id_row = cursor.fetchone()
        country_id = country_id_row[0]

        # Insert or update health_statistics
        cursor.execute("""
            INSERT INTO health_statistics (country_id, total_cases, total_deaths, total_recovered, serious_critical)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (country_id) DO UPDATE 
            SET total_cases = EXCLUDED.total_cases,
                total_deaths = EXCLUDED.total_deaths,
                total_recovered = EXCLUDED.total_recovered,
                serious_critical = EXCLUDED.serious_critical;
        """, (country_id, entry.total_cases, entry.total_deaths, entry.total_recovered, entry.serious_critical))

        # Insert or update testing_statistics
        cursor.execute("""
            INSERT INTO testing_statistics (country_id, total_tests)
            VALUES (%s, %s)
            ON CONFLICT (country_id) DO UPDATE 
            SET total_tests = EXCLUDED.total_tests;
        """, (country_id, entry.total_tests))

        cursor.connection.commit()

    except psycopg2.IntegrityError as e:
        cursor.connection.rollback()
        raise HTTPException(status_code=400, detail=f"Données invalides : {str(e)}")
    
    except Exception as e:
        cursor.connection.rollback()
        raise HTTPException(status_code=500, detail=f"Erreur d'insertion : {str(e)}")

    return {"message": "Entry added successfully"}


# Route PATCH pour modifier une entrée
@app.patch("/covid/{country}")
def partial_update_entry(country: str, entry: CovidEntryPatch, cursor=Depends(get_db), current_user: str = Depends(get_current_user)):
    
    cursor.execute("SELECT id FROM countries WHERE country = %s", (country,))
    result = cursor.fetchone()
    if not result:
        raise HTTPException(status_code=404, detail="Country not found")
    country_id = result["id"]

    data = entry.dict(exclude_unset=True)
    for key, value in data.items():
        if key in ["continent", "who_region", "population"]:
            cursor.execute(f"UPDATE countries SET {key} = %s WHERE id = %s", (value, country_id))
        elif key in ["total_cases", "total_deaths", "total_recovered", "serious_critical"]:
            cursor.execute(f"UPDATE health_statistics SET {key} = %s WHERE country_id = %s", (value, country_id))
        elif key == "total_tests":
            cursor.execute("UPDATE testing_statistics SET total_tests = %s WHERE country_id = %s", (value, country_id))

    cursor.connection.commit()
    
    # Récupérer les données mises à jour
    cursor.execute("""
        SELECT c.country, c.continent, c.who_region, c.population,
               h.total_cases, h.total_deaths, h.total_recovered, h.serious_critical,
               t.total_tests
        FROM countries c
        LEFT JOIN health_statistics h ON c.id = h.country_id
        LEFT JOIN testing_statistics t ON c.id = t.country_id
        WHERE c.id = %s
    """, (country_id,))
    updated_data = cursor.fetchone()

    return {
        "message": f"Entry partially updated successfully for country '{country}'",
        "data": dict(updated_data)
    }


# La route pour supprimer une entrée
@app.delete("/covid/{country}")
def delete_entry(country: str, cursor=Depends(get_db), current_user: str = Depends(get_current_user)):
    try:
        # On récupérer d'abord l'ID du pays
        cursor.execute("SELECT id FROM countries WHERE country = %s", (country,))
        result = cursor.fetchone()

        if not result:
            raise HTTPException(status_code=404, detail="Country not found")

        country_id = result["id"]

        # Puis, on supprimes les entrées dépendantes
        cursor.execute("DELETE FROM testing_statistics WHERE country_id = %s", (country_id,))
        cursor.execute("DELETE FROM health_statistics WHERE country_id = %s", (country_id,))
        cursor.execute("DELETE FROM countries WHERE id = %s", (country_id,))

        cursor.connection.commit()
        return {"message": f"Entry for '{country}' deleted successfully"}
    

    except Exception as e:
        cursor.connection.rollback()
        raise HTTPException(status_code=500, detail=f"Erreur lors de la suppression : {str(e)}")

