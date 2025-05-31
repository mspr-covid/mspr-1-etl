from pydantic import BaseModel, Field
from typing import Optional

class CovidEntryPatch(BaseModel):
    continent: Optional[str] = Field(None, description="Name of the continent", example="Europe")
    who_region: Optional[str] = Field(None, description="WHO region code from World Health Organization", example="EURO")
    population: Optional[int] = Field(None, description="Population number", example=67000000)
    total_cases: Optional[int] = Field(None, description="Total confirmed cases", example=1000000)
    total_deaths: Optional[int] = Field(None, description="Total number of deaths", example=50000)
    total_recovered: Optional[int] = Field(None, description="Total number of recoveries", example=950000)
    serious_critical: Optional[int] = Field(None, description="Number of serious/critical cases", example=2000)
    total_tests: Optional[int] = Field(None, description="Total number of tests conducted", example=20000000)
