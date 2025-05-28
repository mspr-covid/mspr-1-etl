from pydantic import BaseModel, Field
from typing import Optional

class CovidEntryPatch(BaseModel):
    continent: Optional[str] = Field(None, json_schema_extra={"Continent where the country is located :": "Europe"})
    who_region: Optional[str] = Field(None, json_schema_extra={"Name used by World Health Organization : ": "EURO"})
    population: Optional[int] = Field(None, json_schema_extra={"Population number :": 67000000})
    total_cases: Optional[int] = Field(None, json_schema_extra={"Total cases :": 1000000})
    total_deaths: Optional[int] = Field(None, json_schema_extra={"Total deaths :": 50000})
    total_recovered: Optional[int] = Field(None, json_schema_extra={"Total recovered :": 950000})
    serious_critical: Optional[int] = Field(None, json_schema_extra={"Serious critical cases": 2000})
    total_tests: Optional[int] = Field(None, json_schema_extra={"Total tests conducted :": 20000000})

