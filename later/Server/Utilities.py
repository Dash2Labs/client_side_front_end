# Copyright 2023 Dash2Labs, LLC.  All rights reserved.
'''General utility functions for Dash2Labs.'''
import sys
import json
import threading
import _thread as thread  # Low-level threading API
from datetime import datetime

def unexpected(string):
    '''Returns True if the string is unexpected.'''
    return string in ["undefined", None, "", 0, '[]']

def stringify_dict(d: dict):
    '''Converts a dictionary to a string for Dash Ids using dictionaries for callbacks.'''
    return json.dumps(d, sort_keys=True, separators=(',', ':'))

def unstringify_dict(s: str):
    '''Converts a string to a dictionary for Dash Ids using dictionaries for callbacks.'''
    return json.loads(s)

def convert_string_to_datetime(_input: str):
    '''Converts a string to a datetime object.'''
    if len(_input) != len('%Y-%m-%d %H:%M:%S'):
        raise ValueError(f'Incorrect string format: {len(_input)}.  Correct format is %Y-%m-%d %H:%M:%S')
    return datetime.strptime(_input, '%Y-%m-%d %H:%M:%S')

def convert_datetime_to_epoch(_input: datetime):
    '''Converts a datetime object to epoch time.'''
    return int(_input.timestamp())

def interupt_after(time_limit):
    ''' Decorator to raise KeyboardInterrupt if function takes more than
        `time_limit` seconds to execute.
    '''
    def quit_func(func_name):
        print(f'{func_name}() took too long', file=sys.stderr)
        sys.stderr.flush()
        thread.interrupt_main()  # Raises KeyboardInterrupt.

    def decorator(func):
        def decorated(*args, **kwargs):
            timer = threading.Timer(time_limit, quit_func, args=[func.__name__])
            timer.start()
            result = None
            try:
                result = func(*args, **kwargs)  # Note return value ignored.
            except KeyboardInterrupt:
                return False, None
            finally:
                timer.cancel()
            return True, result
        return decorated

    return decorator
