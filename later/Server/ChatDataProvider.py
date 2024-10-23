# Copyright 2023 Dash2Labs, LLC.  All rights reserved.
'''Provides functions for retrieving chat data from mongo.'''
from datetime import datetime
import pandas as pd
from mistralai.client import MistralClient
from MongoDBConnector import MongoDBConnector
from Constants import Constants
from ErrorLogger import ErrorLogger
from Utilities import convert_datetime_to_epoch
from Validations import Validations

mistral_ai_client = MistralClient(api_key=Constants.get_mistral_ai_key())

class ChatDataProvider:
    '''Provides functions for retrieving chat data from mongo.'''
    _max_history_length = Constants.config['max_chat_history_length']

    def __init__(self):
        self.dbname = Constants.get_database()
        self.client = {}
        self.db = {}
        self._initialize()
        self.log = ErrorLogger("ChatDataProvider.log")
        self.logger = self.log.get_logger()
        self.validator = Validations(self.client, self.db)

    def get_chat_history(self, user_id, thread_id):
        '''Get chat history for a given user.'''
        try:
            if not MongoDBConnector.get_client_status():
                self._initialize_database()
            chat_history = self.db['chat_history'].find({'user_id': user_id, 'thread_id': thread_id})
            chat_history = self._process_chat_history(chat_history)
            return chat_history
        except Exception as err:
            self.logger.error(err)
            return []

    def save_chat_history(self, user_id, question, answer, thread_id):
        '''Save chat history for a given user.'''
        try:
            if not MongoDBConnector.get_client_status():
                self._initialize_database()
            chat_history = self.db['chat_history']
            chat_history.insert_one({
                'user_id': user_id,
                'question': question,
                'answer': answer,
                'timestamp': convert_datetime_to_epoch(datetime.now()),
                'thread_id': thread_id
            })
        except Exception as err:
            self.logger.error(err)

    def query_with_search(self, collection, question):
        '''Query with vector search based on question.'''
        try:
            if not MongoDBConnector.get_client_status():
                self._initialize_database()
            question_embedding = self._create_embedding(question)
            tokens = 100
            if question_embedding is None:
                return "Failed to create embedding"
            pipeline = self._create_vector_search_pipeline(collection, question_embedding)
            search_results = self.db['files'].aggregate(pipeline)
            search_results = self._process_results(search_results) 
            for result in search_results:
                file_name = result.get('file')
                page_number = result.get('page')
                text_data = self.db['files'].find_one({'file': file_name, 'page': page_number})
                if text_data:
                    result['text'] = text_data.get('text', '')
            return search_results, tokens
        except Exception as err:
            self.logger.error(err)
            return err.args[0]

    def _initialize(self):
        '''Initialize the functions.'''
        self._initialize_database()

    def _initialize_database(self):
        '''Initialize the database.'''
        if not MongoDBConnector.get_client_status():
            MongoDBConnector.connect(Constants.get_database())
        if MongoDBConnector.db is None:
            raise ConnectionAbortedError("Unable to connect to database")
        self.client = MongoDBConnector.client
        self.db = MongoDBConnector.db

    def _create_embedding(self, text):
        '''Create an embedding for the input text using Mistral AI.'''
        try:
            result = mistral_ai_client.embeddings(input=[text], model=Constants.config["embedding_model"])
            embedding = result.data[0].embedding
            if not isinstance(embedding, list) or not all(isinstance(num, (int, float)) for num in embedding):
                raise ValueError("Embedding is not in the correct format")
            return embedding
        except Exception as e:
            self.logger.error(f"Error creating embedding: {e}")
            return None

    def _create_vector_search_pipeline(self, collection, embedding):
        '''Create a MongoDB aggregation pipeline for vector search.'''
        pipeline = [
            {"$vectorSearch": {
                "index": "vector_index",
                "path": "embedding",
                "queryVector": embedding,
                "numCandidates": Constants.config['vector_search_num_candidates'],
                "limit": Constants.config['vector_search_limit'],
            }},
            {"$project": {"embeddings": 0}}
        ]
        return pipeline

    def _process_results(self, results):
        '''Process the results from mongo and return a list of dictionaries.'''
        documents = list(results)
        processed_results = []
        for document in documents:
            processed_document = {
                'file': document['file'],
                'page': document['page'],
            }
            processed_results.append(processed_document)
        return processed_results

    def _process_chat_history(self, chat_history):
        '''Process chat history and return a list of dictionaries.'''
        documents = list(chat_history)
        if len(documents) == 0:
            return []
        if len(documents) > ChatDataProvider._max_history_length:
            documents = documents[(-1*ChatDataProvider._max_history_length):]
        processed_history = []
        for document in documents:
            processed_document = {
                'question': document['question'],  
                'answer': document['answer']
            }
            processed_history.append(processed_document)
        return processed_history
