from pydantic import BaseModel, Field

class CovidPredictionInput(BaseModel):
    total_recovered: int = Field(
        ..., 
        description="Total number of recovered COVID-19 cases in the country.",
        json_schema_extra={"example": 950000}
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
