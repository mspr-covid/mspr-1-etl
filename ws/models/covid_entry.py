from pydantic import BaseModel


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
