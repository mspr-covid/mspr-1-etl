from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
import psycopg2
from psycopg2.extras import DictCursor
from typing import Generator
from dotenv import load_dotenv
import os



app = FastAPI()

load_dotenv()


DB_CONFIG = {
    "dbname": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT"),
}

class WorldometerEntry(BaseModel):
    country: str
    continent: str
    who_region: str
    population: int
    total_cases: int
    total_deaths: int
    total_recovered: int
    serious_critical: int
    total_tests: int

def get_db_connection() -> Generator[psycopg2.extensions.connection, None, None]:
    conn = psycopg2.connect(**DB_CONFIG, cursor_factory=DictCursor)
    try:
        yield conn
    finally:
        conn.close()

@app.get("/worldometer")
def get_all_entries(conn=Depends(get_db_connection)):
    with conn.cursor() as cur:
        cur.execute("""
            SELECT c.country, c.continent, c.who_region, c.population, 
                   h.total_cases, h.total_deaths, h.total_recovered, h.serious_critical, 
                   t.total_tests 
            FROM t_countries c
            LEFT JOIN t_health_statistics h ON c.country = h.country
            LEFT JOIN t_tests t ON c.country = t.country
        """)
        data = cur.fetchall()
    
    if not data:
        raise HTTPException(status_code=404, detail="No data found")
    
    return {"data": [dict(row) for row in data]}

@app.get("/worldometer/{country}")
def get_entry_by_country(country: str, conn=Depends(get_db_connection)):
    with conn.cursor() as cur:
        cur.execute("""
            SELECT c.country, c.continent, c.who_region, c.population, 
                   h.total_cases, h.total_deaths, h.total_recovered, h.serious_critical, 
                   t.total_tests 
            FROM t_countries c
            LEFT JOIN t_health_statistics h ON c.country = h.country
            LEFT JOIN t_tests t ON c.country = t.country
            WHERE c.country = %s
        """, (country,))
        data = cur.fetchone()
    
    if not data:
        raise HTTPException(status_code=404, detail="Country not found")
    
    return {"data": dict(data)}

@app.post("/worldometer")
def add_entry(entry: WorldometerEntry, conn=Depends(get_db_connection)):
    with conn.cursor() as cur:
        try:
            cur.execute("BEGIN;")  
            cur.execute("""
                INSERT INTO t_countries (country, continent, who_region, population)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (country) DO UPDATE 
                SET continent = EXCLUDED.continent,j
                    who_region = EXCLUDED.who_region,
                    population = EXCLUDED.population
            """, (entry.country, entry.continent, entry.who_region, entry.population))

            cur.execute("""
                INSERT INTO t_health_statistics (country, total_cases, total_deaths, total_recovered, serious_critical)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (country) DO UPDATE 
                SET total_cases = EXCLUDED.total_cases,
                    total_deaths = EXCLUDED.total_deaths,
                    total_recovered = EXCLUDED.total_recovered,
                    serious_critical = EXCLUDED.serious_critical
            """, (entry.country, entry.total_cases, entry.total_deaths, entry.total_recovered, entry.serious_critical))

            cur.execute("""
                INSERT INTO t_tests (country, total_tests)
                VALUES (%s, %s)
                ON CONFLICT (country) DO UPDATE 
                SET total_tests = EXCLUDED.total_tests
            """, (entry.country, entry.total_tests))

            conn.commit()
        except Exception as e:
            conn.rollback()
            raise HTTPException(status_code=500, detail=str(e))
    
    return {"message": "Entry added successfully"}

@app.delete("/worldometer/{country}")
def delete_entry(country: str, conn=Depends(get_db_connection)):
    with conn.cursor() as cur:
        try:
            cur.execute("BEGIN;") 
            cur.execute("DELETE FROM t_health_statistics WHERE country = %s", (country,))
            cur.execute("DELETE FROM t_tests WHERE country = %s", (country,))
            cur.execute("DELETE FROM t_countries WHERE country = %s", (country,))
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise HTTPException(status_code=500, detail=str(e))
    
    return {"message": "Entry deleted successfully"}