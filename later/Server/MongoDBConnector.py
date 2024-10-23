# Copyright 2023 Dash2Labs, LLC.  All rights reserved.
'''Provides a class that contains methods to connect to the database'''
import sys
from pymongo import MongoClient
from pymongo.database import Database
import pymongo.errors
from mistralai.client import MistralClient
from Constants import Constants

class MongoDBConnector:
    '''Class that contains methods to connect to the database'''
    client: MongoClient = None
    db: Database = None
    open = False
    max_retry_count = 3
    mistral_client = None

    @classmethod
    def connect(cls, dbname) -> bool:
        """
        Connect to MongoDB Atlas database.
        """
        retry_count = 0
        while(not MongoDBConnector.open and retry_count < cls.max_retry_count):
            retry_count += 1
            try:
                connectionstring = Constants.get_mongo_connection_string()
                cls.client: MongoClient = MongoClient(connectionstring)
                if cls.client is None:
                    raise ConnectionError("Unable to connect to database")
                #pylint: disable=unsubscriptable-object
                cls.db: Database = cls.client[dbname]
                cls.open = True
                print(f"Successfully connected to {dbname} database")
                return True
            except pymongo.errors.ConfigurationError:
                print("An Invalid URI host error was received. Is your Atlas host name correct in your connection string?")
            except ConnectionError as e:
                print(f"{e.args}: {e}")
        cls.open = False
        return False
    
    @classmethod
    def get_db(cls):
        '''Returns the database'''
        return cls.db

    @classmethod
    def get_client_status(cls):
        '''Returns the client status'''
        try:
            cls.client.admin.command('ping')
            return True
        except pymongo.errors.PyMongoError:
            return False

    @classmethod
    def get_client(cls):
        '''Returns the client'''
        return cls.client

    @classmethod
    def get_mistral_client(cls):
        '''Returns the open ai client'''
        if cls.mistral_client is None:
            try:
                cls.mistral_client = MistralClient(api_key=Constants.get_mistral_ai_key())
            except Exception as e:
                cls.mistral_client = None
                print(f"Unable to connect to client for embeding {e.args}: {e}")
                raise ConnectionError(f"Unable to connect to OpenAI {e.args}: {e}") from e
        return cls.mistral_client

    @classmethod
    def generate_embedding(cls, collection, index):
        '''Generates an embedding'''
        if sys.gettrace(): # turn off automatic embeddings when in development mode
            return
        if cls.open is False:
            cls.connect(Constants.get_database())
        client = cls.get_mistral_client()
        # Find the document with the given index
        document = collection.find_one({"_id": index})
        if document is None:
            return
        # Generate the tokens for the embedding
        tokens = []
        for key, value in document.items():
            if key == "_id": # We don't care about embedding the id
                continue
            try:
                value = float(value) # Lets get rid of any number only field
                value = int(value)
                break
            except ValueError:
                pass
            if not isinstance(value, str): # If it isn't a string we don't care about it
                continue
            tokens.extend(value.split(" "))

        # Generate the embedding
        embedding = client.embeddings(input = tokens , model="mistral-embed")
        # Update the document with the embedding
        collection.update_one({"_id": index}, {"$set": {"embedding": embedding.data[0].embedding}})

    @classmethod
    def drop_collection(cls, collection_name):
        """
        Drop a collection from the database if it exists.
        """
        if cls.db is not None:
            if collection_name in cls.db.list_collection_names():
                cls.db.drop_collection(collection_name)
                print(f"Collection {collection_name} dropped.")
        else:
            print("Not connected to a database.")

    @classmethod
    def close_connection(cls):
        """
        Close connection to MongoDB Atlas database.
        """
        if cls.client:
            cls.client.close()
            cls.client = None
            cls.open = False
            return True
        return False

    @classmethod
    def __del__(cls):
        if cls.client:
            cls.close_connection()
        cls.mistral_client = None

MongoDBConnector.connect(Constants.get_database())
