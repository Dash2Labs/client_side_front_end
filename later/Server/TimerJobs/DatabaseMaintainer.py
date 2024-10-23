'''This module maintains the database by cleaning it up and updating it'''
import time
from pymongo.database import Database as DataBase
from MongoDBConnector import MongoDBConnector

class DatabaseMaintainer:
    '''This class maintains the database by cleaning it up and updating it'''
    def __init__(self, database):
        self.database = database
        self.db: DataBase = None
        self._initialize_database()

    def _initialize_database(self):
        '''Initialize the database.'''
        if not MongoDBConnector.get_client_status():
            MongoDBConnector.connect(self.database)
        if MongoDBConnector.db is None:
            raise ConnectionAbortedError("DatabaseMaintainer unable to connect to database")
        self.client = MongoDBConnector.client
        self.db: DataBase = MongoDBConnector.db

    def run(self, max_chat_history_length, sleep_time=60 * 60 * 24):
        '''This function runs the database maintainer'''
        print("Running database maintainer")
        while True:
            self._clean(max_chat_history_length)
            time.sleep(sleep_time)

    def _clean(self, max_chat_history_length):
        '''This function cleans the database'''
        self._clean_chat_history(max_chat_history_length)
    
    def _clean_chat_history(self, max_chat_history_length):
        '''This function cleans the chat history if the number of entries is greater the max allowed'''
        # For each user id, make sure there are only max_chat_history_length entries
        if self.db is None:
            print("DatabaseMaintainer unable to connect to database.  Unconstrained chat history may result.")
            return
        else:
            print("Cleaning chat history")
        chat_history = self.db['chat_history'].find()
        for user_id in chat_history.distinct('user_id'):
            chat_history = self.db['chat_history'].find({'user_id': user_id})
            chat_history = chat_history.sort('timestamp', -1)
            chat_history = chat_history.skip(max_chat_history_length)
            for chat in chat_history:
                self.db['chat_history'].delete_one({'_id': chat['_id']})
        
