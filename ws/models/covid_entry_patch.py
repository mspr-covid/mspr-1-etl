from pydantic import BaseModel, Field
from typing import Optional

class CovidEntryPatch(BaseModel):
    continent: Optional[str] = Field(
        None,
        description="Name of the continent",
        json_schema_extra={"example": "Europe"}
    )
    who_region: Optional[str] = Field(
        None,
        description="WHO region code from World Health Organization",
        json_schema_extra={"example": "EURO"}
    )
    population: Optional[int] = Field(
        None,
        description="Population number",
        json_schema_extra={"example": 67000000}
    )
    total_cases: Optional[int] = Field(
        None,
        description="Total confirmed cases",
        json_schema_extra={"example": 1000000}
    )
    total_deaths: Optional[int] = Field(
        None,
        description="Total number of deaths",
        json_schema_extra={"example": 50000}
    )
    total_recovered: Optional[int] = Field(
        None,
        description="Total number of recoveries",
        json_schema_extra={"example": 950000}
    )
    serious_critical: Optional[int] = Field(
        None,
        description="Number of serious/critical cases",
        json_schema_extra={"example": 2000}
    )
    total_tests: Optional[int] = Field(
        None,
        description="Total number of tests conducted",
        json_schema_extra={"example": 20000000}
    )
