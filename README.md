# Project README

## Steps to Setup the Project

1. **Clone the project**

2. **Install the required dependencies**

   ```bash
   pip install -r requirements.txt
   ```

3. **Create a `.env` file at the root of the project**

4. **Edit the `.env` file as follows:**

   ```
   DB_NAME=YourDatabaseName
   DB_USER=YourUsername
   DB_PASSWORD=YourPassword
   DB_HOST=localhost
   DB_PORT=5432

   EXPORT_CSV_PATH=YourPathForCSVExport
   ```

5. **Run the script**

   ```bash
   python3 covid_mspr1.py
   ```

   For Windows users, it might be:

   ```bash
   py covid_mspr1.py
   ```

   Alternatively, you can use the run button at the top right of VS Code.

6. **To start the API, execute the command:**

   ```bash
   uvicorn ws.covid_api:app --reload
   ```

7. **The API is available on port 8000 and can be accessed via the URL:**

   ```
   http://localhost:8000/worldometer
   ```

8. **To interact with the API, you can use Swagger via the URL:**

   ```
   http://127.0.0.1:8000/docs
   ```

9. **For documentation on the API structure, visit the following URL:**
   ```
   http://127.0.0.1:8000/redoc
   ```

⚠️ test : need update
