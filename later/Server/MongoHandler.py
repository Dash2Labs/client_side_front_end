# Copyright 2023 Dash2Labs, LLC.  All rights reserved.
'''Provides a class that contains methods to insert alerts into the database'''
import os
import logging
import threading
from logging import StreamHandler
from MongoDBConnector import MongoDBConnector
from Constants import Constants

class MongoHandler(StreamHandler):
    '''Handler that inserts logs into the database'''
    def __init__(self):
        StreamHandler.__init__(self)
        self.collection_name = "ProductionLogs"
        self.setFormatter(logging.Formatter(fmt=self.get_format()))

    @classmethod
    def get_format(cls):
        '''Returns the log format'''
        return '%(asctime)s - %(name)s - %(levelname)s - %(message)s'

    def emit(self, record):
        '''Inserts the log record'''
        if os.environ.get('NODE_ENV') == 'development':
            return
        t1 = threading.Thread(target=self._insert_log_record, args=[record])
        t1.start()

    def _insert_log_record(self, record):
        '''Inserts the log record'''
        try:
            if not MongoDBConnector.get_client_status():
                MongoDBConnector.connect(Constants.get_database())
            #pylint: disable=unsubscriptable-object
            collection = MongoDBConnector.db[self.collection_name] # type: ignore
            collection.insert_one(self.map_log_record(record))
        except Exception as e: #pylint: disable=broad-except
            print("Error inserting log record: %s", e)

    def map_log_record(self, record):
        '''Maps the log record'''
        return {
            "timestamp": record.created,
            "level": record.levelname,
            "message": record.message,
            "name": record.name,
        }
