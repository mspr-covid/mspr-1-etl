from fastapi import HTTPException

class CovidEntryValidator:
    @staticmethod
    def validate_non_negative_fields(entry):
        fields = {
            "population": entry.population,
            "total_cases": entry.total_cases,
            "total_deaths": entry.total_deaths,
            "total_recovered": entry.total_recovered,
            "serious_critical": entry.serious_critical,
            "total_tests": entry.total_tests,
        }

        for field_name, value in fields.items():
            if value < 0:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Le champ '{field_name}' doit être un entier positif"
                )
