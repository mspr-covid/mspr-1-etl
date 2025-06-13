from pydantic import BaseModel, Field

class CovidPredictionInputV2(BaseModel):
    continent: str = Field(
        ..., 
        description="Continent of the country (e.g., Asia, Europe, Africa).",
        json_schema_extra={"example": "Asia"}
    )
    who_region: str = Field(
        ..., 
        description="WHO region classification (e.g., EMRO, EURO, PAHO).",
        json_schema_extra={"example": "EMRO"}
    )
    country: str = Field(
        ..., 
        description="Name of the country.",
        json_schema_extra={"example": "India"}
    )
    population: int = Field(
        ..., 
        description="Total population of the country.",
        json_schema_extra={"example": 1380000000}
    )
    total_recovered: int = Field(
        ..., 
        description="Total number of recovered COVID-19 cases in the country.",
        json_schema_extra={"example": 950000}
    )
    active_cases: int = Field(
        ..., 
        description="Current number of active COVID-19 cases in the country.",
        json_schema_extra={"example": 50000}
    )
    serious_critical: int = Field(
        ..., 
        description="Number of serious or critical COVID-19 cases.",
        json_schema_extra={"example": 2000}
    )
    total_tests: int = Field(
        ..., 
        description="Total number of COVID-19 tests conducted in the country.",
        json_schema_extra={"example": 20000000}
    )
    new_total_cases: int = Field(
        ..., 
        description="Number of new COVID-19 cases recently reported.",
        json_schema_extra={"example": 15000}
    )
