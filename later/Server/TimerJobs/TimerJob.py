'''This file is used to start the scheduler for the metrics'''
from datetime import datetime, timezone
from rq import Queue
from rq_scheduler import Scheduler
from Metrics import Metrics
from PrepareRedis import get_redis_connection

def start_scheduler():
    '''Start the scheduler'''
    try:
        queue = Queue('MetricRunner', connection=get_redis_connection())
        scheduler = Scheduler(queue=queue, connection=queue.connection)

        scheduler.schedule(
            scheduled_time=datetime.now(timezone.utc), # Time for first execution, in UTC timezone
            func=Metrics.purge_metrics,                     # Function to be queued
            args=[],             # Arguments passed into function when executed
            kwargs={},         # Keyword arguments passed into function when executed
            interval=600,                   # Time before the function is called again, in seconds
            repeat=None,                     # Repeat this number of times (None means repeat forever)
        )
    except Exception as e: #pylint: disable=broad-except
        print(f"Error: {e.args}: {e}")
        Metrics.self_purge(True)
