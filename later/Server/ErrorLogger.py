# Copyright 2023 Dash2Labs, LLC.  All rights reserved.
'''Create a logger to log for local debugging'''
from multiprocessing import Queue
import logging
import os
from logging.handlers import QueueHandler, QueueListener
from DashFileHandler import DashFileHandler
from MongoHandler import MongoHandler

# implement a QueueHandler with a flush method
class QueueHandlerFlush(QueueHandler):
    '''Create a QueueHandler with a flush method'''
    def __init__(self, queue): #pylint: disable=useless-super-delegation
        super().__init__(queue)  # Call the __init__ method from the base class
        self.queue = queue

    def flush(self):
        while not self.queue.empty():
            record = self.queue.get()
            self.emit(record)
        self.release()
        self.queue.close()
        self.close()

# implement a QueueListener with a flush method
class QueueListenerFlush(QueueListener):
    '''Create a QueueListener with a flush method'''
    def __init__(self, queue, *handlers, respect_handler_level=False): #pylint: disable=useless-super-delegation
        super().__init__(queue, *handlers, respect_handler_level=respect_handler_level)

    def flush(self):
        '''Flush the queue'''
        try:
            self.stop()
        except Exception: #pylint: disable=broad-except
            pass

class ErrorLogger:
    '''Create a logger to log for local and production debugging'''
    loggers = []
    def __init__(self, log_file_name):
        ErrorLogger.loggers.append(self)
        self.log_file_name = log_file_name
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.INFO)
        self.que = Queue(-1)
        self.queue_handler = QueueHandlerFlush(self.que)
        self.queue_handler.setLevel(logging.DEBUG)
        self.queue_handler.setFormatter(logging.Formatter(DashFileHandler.get_format()))
        self.logger.addHandler(self.queue_handler)
        self.stream_handler = MongoHandler()
        self.file_handler = DashFileHandler(os.path.join(os.path.dirname(__file__), 'logs', self.log_file_name))
        self.ql = QueueListenerFlush(self.que, (self.file_handler, self.stream_handler))
        self.ql.start()

    def get_logger(self):
        '''Get the logger'''
        return self.logger

    @classmethod
    def close_loggers(cls):
        '''Close the loggers'''
        for logger in cls.loggers:
            try:
                if logger.queue_handler:
                    logger.queue_handler.flush()
                if logger.file_handler:
                    logger.file_handler.close()
                if logger.ql:
                    logger.ql.flush()
            except Exception: #pylint: disable=broad-except
                continue
        cls.loggers = []
