#!/bin/sh
python mspr1/covid_mspr1.py
exec uvicorn ws.covid_api:app --host 0.0.0.0 --port 8000
