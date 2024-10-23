'''Prepares the redis connection for the server'''
import redis
from Constants import Constants

R = None
try:
    CONNECTION_STRING = Constants.get_redis_connection_string()
    PASSWORD = Constants.get_redis_password()

    R = redis.StrictRedis(
        host=Constants.config['cache']['host'],
        port=Constants.config['cache']['port'],
        password=PASSWORD,
        ssl=True)
except Exception as e: #pylint: disable=broad-except
    print(f"Error: {e.args}: {e}")
    R = None

def get_redis_connection():
    '''Returns the redis connection'''
    return R
