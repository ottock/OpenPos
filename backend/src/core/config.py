from os import getenv
from dotenv import load_dotenv


class Config:
    def __init__(self):
        load_dotenv()

        # BACKEND
        self.api_host = getenv("API_HOST")
        self.api_port = getenv("API_PORT")

        # DATABASE
        self.db_host = getenv("DB_HOST")
        self.db_user = getenv("DB_USER")
        self.db_password = getenv("DB_PASSWORD")
        self.db_port = getenv("DB_PORT")
        self.db_database = getenv("DB_DATABASE")

        # FRONTEND
        self.vite_host = getenv("VITE_HOST")
        self.vite_port = getenv("VITE_PORT")