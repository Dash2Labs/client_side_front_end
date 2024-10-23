# Copyright 2023 Dash2Labs, LLC.  All rights reserved.
'''Create a custom logging file handler'''
from threading import Thread
from logging import FileHandler, Formatter
import random
import os

class DashFileHandler(FileHandler):
    '''Create a custom logging file handler'''
    def __init__(self, filename, mode='a', encoding=None, delay=False):
        if not os.path.exists(os.path.dirname(filename)):
            os.makedirs(os.path.dirname(filename))
        FileHandler.__init__(self, filename, mode, encoding, delay)
        self.setFormatter(Formatter(self.get_format()))
        self.threads = {}

    @classmethod
    def get_format(cls):
        '''Get the format for the log file'''
        return '%(asctime)s - %(name)s - %(levelname)s - %(message)s'

    def flush(self):
        '''Flush the file'''
        # flush all the records in the queue
        for thread_index in self.threads: #pylint: disable=consider-using-dict-items
            try:
                self.threads[thread_index].join()
            #pylint: disable=broad-except
            except Exception:
                pass

    def close(self):
        '''Close the file'''
        # flush all the records in the queue
        try:
            self.flush()
            FileHandler.close(self)
        #pylint: disable=broad-except
        except Exception:
            pass

    def emit(self, record):
        if os.getenv('NODE_ENV') == 'Development':
            thread_index = random.randint(0, 1000000)
            t1 = Thread(target=self.insert_log_record, args=[record])
            self.threads[thread_index] = t1
            t1.start()

    def insert_log_record(self, record):
        '''Insert a log record into the file'''
        try:
            super().emit(record)
        #pylint: disable=broad-except
        except Exception as e:
            print(f"Could not insert log record{e.args}: {e}")
