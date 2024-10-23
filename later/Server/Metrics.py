'''Metrics.py'''
import threading
import json
import sys
import time
from datetime import datetime
from MongoDBConnector import MongoDBConnector

#pylint: disable=too-many-instance-attributes
class MetricObject:
    '''Create a metric object to store metrics'''
    def __init__(self, name, tags=None):
        self.name = name
        self.tags = tags or {}
        self.start_time = datetime.now()
        self.end_time = None
        self.duration = None
        self.message = ""
        self.result = None
        self.error = None
        Metrics.metric_objects.append(self)

    def add_tag(self, key, value):
        '''Add a tag to the metric object'''
        self.tags[key] = value

    def add_message(self, message):
        '''Add a message to the metric object'''
        self.message = self.message + " " + message

    def add_result(self, result):
        '''Add a result to the metric object'''
        self.result = result

    def add_end_time(self, end_time):
        '''Add an end time to the metric object'''
        self.end_time = end_time

    def add_duration(self, duration):
        '''Add a duration to the metric object'''
        self.duration = duration

    def add_error(self, error):
        '''Add an error to the metric object'''
        self.error = error

    def to_json(self):
        '''Convert the metric object to json'''
        return json.dumps(self, default=lambda o: o.__dict__, sort_keys=True, indent=4)

class Metrics:
    '''Create a class to store metrics'''
    metric_objects = []
    db_name = "Metrics"
    
    def __init__(self, name, db):
        self.name = name
        Metrics.db_name = db

    @staticmethod
    def get_size():
        '''Get the size of the metric objects list'''
        return sys.getsizeof(Metrics.metric_objects)

    @staticmethod
    def self_purge(activate):
        '''Purge the metric objects list using a time sleep thread'''
        if activate:
            def purge_metrics_periodically():
                while True:
                    Metrics.purge_metrics()
                    time.sleep(60)

            purge_thread = threading.Timer(60, purge_metrics_periodically)
            purge_thread.daemon = True
            purge_thread.start()

    @staticmethod
    def purge_metrics(self):
        '''Purge the metric objects list'''
        if Metrics.get_size() > 0:
            if not MongoDBConnector.get_client_status():
                MongoDBConnector.connect('Metrics')
            try:
                print(f"Inserting {len(Metrics.metric_objects)} metrics")
                MongoDBConnector.get_client().get_database(Metrics.db_name)["Metrics"].insert_many(Metrics.metric_objects)
                Metrics.metric_objects = []
            except Exception as e: #pylint: disable=broad-except
                print(f"Error inserting metrics: {e.args}: {e}")
                
    def upload_metrics():
        '''Upload the metrics to MongoDB'''
        if not MongoDBConnector.get_client_status():
            MongoDBConnector.connect(Metrics.db_name)
        try:
            print(f"Uploading {len(Metrics.metric_objects)} metrics")
            MongoDBConnector.get_client().get_database(Metrics.db_name)["Metrics"].insert_many(
                [metric.__dict__ for metric in Metrics.metric_objects]
            )
            Metrics.metric_objects = []
        except Exception as e:  # pylint: disable=broad-except
            print(f"Error uploading metrics: {e.args}: {e}")

    @staticmethod
    def to_json():
        '''Convert the metric objects list to json'''
        return json.dumps(Metrics.metric_objects, default=lambda o: o.__dict__, sort_keys=True, indent=4)

class MetricManager:
    '''Create a class to manage metrics using a with statement'''
    def __init__(self, metric_name, tags):
        self.metric_name = metric_name
        self.tags = tags
        self.metric_object = None

    def __enter__(self):
        self.metric_object = MetricObject(self.metric_name)
        return self.metric_object

    def __exit__(self, exc_type, exc_value, traceback):
        self.metric_object.end_time = datetime.now()
        self.metric_object.duration = (self.metric_object.end_time - self.metric_object.start_time).total_seconds()
        self.metric_object.error = exc_value
        self.metric_object.tags = self.tags
        if exc_value is not None:
            self.metric_object.add_message(exc_value.args[0])
        return True
