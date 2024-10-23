'''This file contains the Constants class, which is used to store and retrieve secrets from Azure Key Vault.
It also contains a class variable to store the database name.'''
import os
import sys
import toml
from azure.keyvault.secrets import SecretClient
from azure.identity import DefaultAzureCredential
from cryptography.fernet import Fernet

#pylint: disable=multiple-statements, missing-function-docstring
class Constants:
    '''A class for constants'''
    db_username = ""
    db_password = ""
    dbserver = ""
    database = ""
    mongo_connection_string =  ""
    credential = None
    client = None
    os.environ['pkey'] = Fernet.generate_key().decode()
    redis_connection_string = ""
    redis_password = ""
    config = {}

    @classmethod
    def initialize_class(cls, is_debug=False):
        '''Initializes the class'''
        cls._load_configuration()
        cls.credential = DefaultAzureCredential(managed_identity_client_id=cls.config['user_assigned_client_id'])
        cls.client = SecretClient(vault_url=cls.config['kv_uri'], credential=cls.credential)
        if is_debug:
            print("Initializing secrets in development mode.")
            from dotenv import load_dotenv #pylint: disable=import-outside-toplevel
            load_dotenv()
            cls._set_db_username(os.environ['DB_USERNAME'])
            cls._set_db_password(os.environ['DB_PASSWORD'])
            cls._set_dbserver(os.environ['DB_SERVER'])
            #pylint: disable-next=line-too-long
            cls._set_mongo_connection_string(f"mongodb+srv://{cls.get_db_username()}:{cls.get_db_password()}@{cls.get_db_server()}.mongodb.net/?retryWrites=true&w=majority")
            cls._set_mistral_ai_key(os.environ['MISTRAL_AI_KEY'])
#            cls._set_assistant_id(os.environ['_ID'])
        else:
            print("Initializing secrets in production mode.")
            cls._set_db_username(cls._get_secret('dbusername'))
            cls._set_db_password(cls._get_secret('MongoDBPassword'))
            cls._set_dbserver(cls._get_secret('dbserver'))
            #pylint: disable-next=line-too-long
            cls._set_mongo_connection_string(f"mongodb+srv://{cls.get_db_username()}:{cls.get_db_password()}@{cls.get_db_server()}.mongodb.net/?retryWrites=true&w=majority")
            cls._set_mistral_ai_key(cls._get_secret('mistralai-apikey'))
            cls._set_assistant_id(cls._get_secret('BobbyId'))
#        cls._set_redis_connection_string(cls._get_secret('redisconnection'))
#        cls._set_redis_password(cls._get_secret('redispassword')) 
        cls._set_database(cls.config['database'])

    @classmethod
    def _set_redis_connection_string(cls, redis_connection_string):
        cls.redis_connection_string = redis_connection_string

    @classmethod
    def _set_redis_password(cls, redis_password):
        cls.redis_password = redis_password

    @classmethod
    def encrypt(cls, plaintext):
        '''Encrypts a string'''
        # f = Fernet(os.environ['pkey'].encode())
        # return f.encrypt(plaintext.encode()).decode()
        return plaintext

    @classmethod
    def decrypt(cls, ciphertext):
        '''Decrypts a string'''
        # f = Fernet(os.environ['pkey'].encode())
        # return f.decrypt(ciphertext.encode()).decode()
        return ciphertext

    @classmethod
    def _set_db_username(cls, db_username):
        cls.db_username = cls.encrypt(db_username)

    @classmethod
    def _set_db_password(cls, db_password):
        cls.db_password = cls.encrypt(db_password)

    @classmethod
    def _set_dbserver(cls, dbserver):
        cls.dbserver = cls.encrypt(dbserver)

    @classmethod
    def _set_database(cls, database):
        cls.database = database

    @classmethod
    def _set_mongo_connection_string(cls, mongo_connection_string):
        cls.mongo_connection_string = cls.encrypt(mongo_connection_string)

    @classmethod
    def _set_mistral_ai_key(cls, mistral_ai_key):
        cls.mistral_ai_key = cls.encrypt(mistral_ai_key)

    @classmethod
    def _set_assistant_id(cls, assistant_id):
        cls.assistant_id = cls.encrypt(assistant_id)

    @classmethod
    def get_database(cls):
        return cls.database

    @classmethod
    def get_mongo_connection_string(cls):
        return cls.decrypt(cls.mongo_connection_string)

    @classmethod
    def get_db_username(cls):
        return cls.decrypt(cls.db_username)

    @classmethod
    def get_db_password(cls):
        return cls.decrypt(cls.db_password)

    @classmethod
    def get_db_server(cls):
        return cls.decrypt(cls.dbserver)

    @classmethod
    def get_mistral_ai_key(cls):
        return cls.decrypt(cls.mistral_ai_key)

    @classmethod
    def get_assistant_id(cls):
        return cls.decrypt(cls.assistant_id)

    @classmethod
    def get_redis_connection_string(cls):
        return cls.redis_connection_string

    @classmethod
    def get_redis_password(cls):
        return cls.redis_password

    @classmethod
    def _get_secret(cls, secret_name):
        retrieved_secret = cls.client.get_secret(secret_name)
        return retrieved_secret.value

    @classmethod
    def _get_secrets(cls):
        secrets = cls.client.list_properties_of_secrets()
        return secrets

    @classmethod
    def _load_configuration(cls):
        '''Loads the configuration file'''
        customer_settings = "./customer_settings.toml"
        customer_settings = os.path.join(os.path.dirname(__file__), customer_settings)
        if not os.path.isfile(customer_settings):
            raise FileNotFoundError(f"File {customer_settings} not found")
        with open(customer_settings, "r", encoding="utf-8") as file:
            cls.config = toml.load(file)

if sys.gettrace() or os.getenv("NODE_ENV") == "development":
    Constants.initialize_class(True)
else:
    Constants.initialize_class()
