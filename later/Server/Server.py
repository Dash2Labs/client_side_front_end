'''This file is the main server file for the Dash2Labs Bobby project'''
import os
import sys
import multiprocessing
from multiprocessing import Process
import json
from quart import request , Response
from quart_trio import QuartTrio
import bleach
from ChatDriver import ChatDriver
from ChatDataProvider import ChatDataProvider
from Constants import Constants
from TimerJobs.DatabaseMaintainer import DatabaseMaintainer

if os.environ["NODE_ENV"] != "production" if "NODE_ENV" in os.environ else True:
    from dotenv import load_dotenv
    load_dotenv()

PORT = os.getenv("SERVER_PORT")

app = QuartTrio(__name__)
chat_driver = ChatDriver()
chat_data_provider = ChatDataProvider()

default_headers = {"Content-Security-Policy": Constants.config['default_headers']['Content-Security-Policy'],
                   "X-Content-Type-Options": Constants.config['default_headers']['X-Content-Type-Options'],
                   "X-Frame-Options": Constants.config['default_headers']['X-Frame-Options'],
                   "X-XSS-Protection": Constants.config['default_headers']['X-XSS-Protection'],
                   "Referrer-Policy": Constants.config['default_headers']['Referrer-Policy'],
                   "Feature-Policy": Constants.config['default_headers']['Feature-Policy'],
                   "Permissions-Policy": Constants.config['default_headers']['Permissions-Policy'],
                   "Strict-Transport-Security": Constants.config['default_headers']['Strict-Transport-Security']}

@app.route("/api/ask/<string:question>", methods=["POST"])
async def ask(question):
    '''This function asks OpenAI a question and returns the response'''
    question = bleach.clean(question)
    body: str = await request.get_data(as_text=True)
    body = bleach.clean(body)
    json_body = json.loads(s=body)
    thread_id = request.headers.get("dash2labs-thread-id")
    thread_id = bleach.clean(thread_id)
    answer = chat_driver.ask_llm(question, json_body['userId'], thread_id)
    headers = {"dash2labs-thread-id": thread_id}
    headers.update(default_headers)
    return answer, 200, headers

@app.post("/api/ask/feedback/submit")
async def submit():
    '''Takes a document and uploads to mango db databse'''
    data = await request.get_json()
    response = await chat_driver.uploadSchema(data)
    if response is None:
        return Response({"error": "No response from uploadSchema"}, status=501)
    if "error" in response:
        return Response(response, status=500)
    if "id" not in response:
        return Response(response, status=200)
    return response

@app.route("/api/history", methods=["GET"])
async def get_history():
    '''This function gets the chat history for a given user.'''
    user_id = await request.headers.get("dash2labs-user-id")
    user_id = bleach.clean(user_id)
    thread_id = await request.headers.get("dash2labs-thread-id")
    thread_id = bleach.clean(thread_id)
    history = chat_data_provider.get_chat_history(user_id, thread_id)
    headers = {"dash2labs-thread-id": thread_id}
    headers.update(default_headers)
    return history, 200, headers

if __name__ == "__main__":
    db_config = Constants.get_database()  
    databaseMaintainer = DatabaseMaintainer(db_config)
    """    p = Process(target=databaseMaintainer.run, args=[Constants.config['max_chat_history_length'], Constants.config['database_maintainer_sleep_time']])
    p.start()
    print("DatabaseMaintainer PID: ", p.pid) """
    if sys.gettrace() or os.getenv("NODE_ENV") == "development":
        print("Running in development mode")
        app.run(port=PORT)
    else:
        print(f'Starting python server on port {PORT}')
        multiprocessing.freeze_support()
        app.run(port=PORT)
   
