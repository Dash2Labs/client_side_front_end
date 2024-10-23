# Copyright 2023 Dash2Labs, LLC.  All rights reserved.
'''This module provides communication to and from OpenAI for the Dash2Labs Assistant'''
from typing import List
import uuid
import re
from langchain_mistralai import ChatMistralAI
from langchain_core.prompts import ChatPromptTemplate
from mistralai.client import MistralClient

from Constants import Constants
from ErrorLogger import ErrorLogger
from ChatDataProvider import ChatDataProvider
from Metrics import Metrics, MetricManager, MetricObject    
from MongoDBConnector import MongoDBConnector
import time

class ChatDriver:
    '''This class provides communication to and from Mistral AI for the Dash2Labs Assistant'''
    bad_response: dict[str, List[str]] = {'text': "Something went wrong.", 'files': [], "annotations": []}
    log = ErrorLogger("ChatDriver.log")
    logger = log.get_logger()
    routes = []

    def __init__(self):
        self.model = ChatMistralAI(model="mistral-small-2409", api_key=Constants.get_mistral_ai_key())
        self.client = MistralClient(api_key=Constants.get_mistral_ai_key())
        self.purpose = Constants.config['assistant_purpose']
        self.data_provider = ChatDataProvider()
        self.Metrics = Metrics("Queries", Constants.config['database'])
        self.chain = self.building_chain()
        self.reference_Chain = self.building_reference()
    #First step to refine system prompt. 
    #possible give confidence score

    def building_reference(self):
        '''This function builds the chain for the Mistral AI model, this chaince builds the need for context.'''
        return ChatPromptTemplate.from_messages([
            ("system", "your purpose is to decide if the question needs context. Questions that need context are often asking for a specific answer of people, place, name, contact, location, or purpose. Simple state this question needs context or this question doesn't need context. "),
            #("system", "{history}"),
            ("system", "Here is an example of conversations : \nQuestion: What is the email of a.i. solutions\nAnswer: This question needs context\nQuestion: hello \n Answer: this question does not need context"),
            ("user", "{question}")
        ]) | self.model
    
    def building_checker(self):
        '''This function builds the chain for the Mistral AI model, this chaince builds the need for context.'''
        return ChatPromptTemplate.from_messages([
            ("system", "your purpose is to decide if the question needs context. Questions that need context are often asking for a specific answer of people, place, name, contact, location, or purpose. Simple state this question needs context or this question doesn't need context. "),
            #("system", "{history}"),
            ("system", "Here is : \nQuestion: What is the email of a.i. solutions\nAnswer: This question needs context\nQuestion: hello \n Answer: this question does not need context"),
            ("user", "{question}")
        ]) | self.model
        
    def building_extractor(self):
        '''This function builds the chain for the Mistral AI model'''
        return ChatPromptTemplate.from_messages([
            ("system", self.purpose),
            #("system", "{history}"),
            ("system", "Examples of conversations:\nQuestion: what is the email of x company\nThought: To find the email it will be under contact email section , x@gmail.com\nAnswer: the company email is x@gmail.com\n\nQuestion: What are companies that specialize in y activity\n Thought: Gather all the companies that do y activity. Then list them off. What the companies does will be attached to What We Do SPECIALIZATION TAGS column. \n Answer: the companies that specialize in y are a, b, c "),
            ("system", "{context}"),
            ("user", "{question}")
        ]) | self.model
    
    def building_chain(self):
        '''This function builds the chain for the Mistral AI model'''
        return ChatPromptTemplate.from_messages([
            ("system", self.purpose),
            #("system", "{history}"),
            ("system", "Examples of conversations:\nQuestion: what is the email of x company\nThought: To find the email it will be under contact email section , x@gmail.com\nAnswer: the company email is x@gmail.com\n\nQuestion: What are companies that specialize in y activity\n Thought: Gather all the companies that do y activity. Then list them off. What the companies does will be attached to What We Do SPECIALIZATION TAGS column. \n Answer: the companies that specialize in y are a, b, c "),
            ("system", "{context}"),
            ("user", "{question}")
        ]) | self.model

    def ask_llm(self, question: str, user_id: str, thread_id: str = None):
        """_summary_
        This is the main function for interacting with the llms. The general direction of it is 
        first: check if question needs context for a vector search. 
        second: if a vector search get context
        third/second: send question to LLM and return response

        Args:
            question (str): user's question
            user_id (str): which user is asking this question
            thread_id (str, optional): Needs.

        Returns:
            _type_: returns a object of dict with {'text': answer}
        """
        roundtrip_counter = 0
        total_start_time = time.perf_counter()

        try:
            if thread_id is None:
                thread_id = str(uuid.uuid4())
            chat_history = self.data_provider.get_chat_history(user_id, thread_id)
            chat_history = self.convert_chat_history_to_string(chat_history)
            
            
            with MetricManager("ask_llm", {"user_id": user_id, "thread_id": thread_id, "question": question}) as metric_object:
                history_message = f'For reference, here is previous chat history: {chat_history}'
                
                
                metric_object.add_message(question)
                
                needs_context_q = self.reference_Chain.invoke({"question" : question}).content
                print('\nfirst response\n')
                print(needs_context_q)
                
                vector_search_done = False
                
                #add back history when finished
                try:
                    if re.search(rf'\b{"doesn't"}\b', needs_context_q) or re.search(rf'\b{"does not"}\b', needs_context_q):
                        vector_search_done = True
                        roundtrip_counter += 1
                        response = self.chain.invoke({"context": "For this question no context is required", "question": question})
                        answer = response.content
                        tokens = response.response_metadata['token_usage']['total_tokens']
                    else:
                        full_question = question 
                        context = ''
                        tool_call_results = self._call_vector_search(question)
                        
                        if tool_call_results:
                            context = "These are the documents for context: " + str(tool_call_results)
                        else:
                            context = "There is no context for this question"
                        print("\nresults returned\n")
                        print(str(tool_call_results))
                        roundtrip_counter += 1
                        response = self.chain.invoke({'context' : context, 'question' : full_question})
                        
                        
                        answer = response.content
                        tokens = response.response_metadata['token_usage']['total_tokens']
                    
                except Exception as e:
                    print(f"Error during chain invocation: {str(e)}")  # Print the error
                    metric_object.add_error(str(e))
                    return ChatDriver.bad_response

                if response is None:
                    print(f"ask_llm: did not return. question: {question}")  # Print the error
                    metric_object.add_error("ask_llm: did not return")
                    return ChatDriver.bad_response

                self.data_provider.save_chat_history(user_id=user_id, question=question, answer=answer, thread_id=thread_id)
                
                total_response_time = time.perf_counter() - total_start_time
                metric_object.add_duration(total_response_time)
                if vector_search_done:
                    metric_object.add_tag("tokens", tokens)
                metric_object.add_result(answer)
                metric_object.add_end_time(time.perf_counter())
                metric_object.add_tag("roundtrips", roundtrip_counter)
                Metrics.upload_metrics()
                
                return {"text" : answer}

        except Exception as e:
            print(f"Error in ask_llm: {str(e)}")  # Print the error
            return ChatDriver.bad_response


    async def uploadSchema(self, data):
        """_summary_
    This function uploads the feedback schema to the database

    Args:
        question (data): all the required data


    Returns:
        _type_: returns a true or false for sucess
    

    feedback_schema = {
        "type": "object",
        "properties": {
            "responseTime": {"type": "number"},
            "fid": {"type": "string"},
            "question": {"type": "string"},
            "response": {"type": "string"},
            "text": {"type": "string"},
            "date": {"type": "string", "format": "date-time"}
        },
        "required": ["text", "date"]
    }"""
        try:
            if not MongoDBConnector.get_client_status():
                MongoDBConnector.connect(Constants.get_database())
            if MongoDBConnector.db is None:
                raise ConnectionAbortedError("Unable to connect to database")
            if MongoDBConnector.get_client_status():
                feedback_document = {
                    "text": data['text'],
                    "date": data['date'],
                    "emoji": data['fid'],
                    "question": data['question'],
                    'response': data['response'],
                    'responseTime': data['responseTime']
                    }
                MongoDBConnector.db['Feedback'].insert_one(feedback_document)
                return {"success": True, "message": "Schema uploaded successfully"}
        except Exception as e:
            ChatDriver.logger.error(f"Error uploading schema: {str(e)}")
            return {"error": str(e)}
        

    def _call_vector_search(self, question: str):
        '''This function calls the vector search tool'''
        return self._call_tool(question=question)



    def _call_tool(self, question):
        '''This function gets the tool from the database'''
        results, tokens =self.data_provider.query_with_search(collection=Constants.config['collection1'],question=question )
        return results, tokens
    
    def convert_chat_history_to_string(self,chat_history):
        chat_history_string = ""
        for entry in chat_history:
            question = entry.get("question", "")
            answer = entry.get("answer", "")
            chat_history_string += f"Question: {question}\nAnswer: {answer}\n\n"
        return chat_history_string
