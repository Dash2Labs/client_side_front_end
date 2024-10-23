# pylint: skip-file
import pytest
import sys
sys.path.append('../Server')
from humanfriendly import format_timespan
from ErrorLogger import ErrorLogger
from codetiming import Timer
from ChatDriver import ChatDriver
from ChatDataProvider import ChatDataProvider
import inspect
from os.path import basename
import time

class TestCodeTime:
    log = ErrorLogger("TestCodeTime.log")
    logger = log.get_logger()
    chat_data_provider = ChatDataProvider()
    (crime, vehicles, k9, weapons, certifications, sops, hr) = chat_data_provider.load_data()

    '''Setup for code timing'''
    @pytest.fixture(autouse=True)
    def setup(self):
        self.timer = Timer(name="TestCodeTime")
        self.timer.start()
        yield
        self.timer.stop()
        TestCodeTime.logger.info(f"TestCodeTime:: {format_timespan(self.timer.last)}")

    def teardown_class(self):
        # Call the method here
        return
    # closing the loggers is not working correctly.  The loggers are closed before finished.  Some sort of race condition.
        # try:
        #     ErrorLogger.close_loggers()
        # except Exception:
        #     pass

    def log_assert(self, arg=None):
        caller = inspect.stack()[1]
        if arg is None:
            with open(caller[1], "r") as source_code:
                for n, line in enumerate(source_code):
                    if n >= caller[2] - 1:
                        arg = line.strip
                    break
        if TestCodeTime.logger is not None:
            TestCodeTime.logger.error("[%s:%d - %s] %s" % (basename(caller[1]), caller[2], caller[3], arg))

    def test_HR_by_area(self):
        chat_driver = ChatDriver()
        valid_people = ["Emily Turner", "Isabella Anderson", "James Lee", "Amelia Rodriguez", "Lucas Hernandez"]
        response = chat_driver.ask_openai("Which personnel are assigned to the north area? use the ask_hr function")
        error_count = 0
        for person in valid_people:
            try:
                assert person in response['text'][0], self.log_assert(f"HR_by_area: Expected {person} to be in response.")
            except AssertionError:
                error_count += 1
        for person in self.hr:
            if person not in valid_people:
                assert person not in response['text'][0], self.log_assert(f"HR_by_area: Expected {person} to not be in response")
        if error_count > 0:
            self.log_assert(f'{response}')
            pytest.fail(f"HR_by_area: {error_count} errors. See log for details.")
        self.teardown_class()
    
    def test_ask_hr_by_params_by_area(self):
        chat_driver = ChatDriver()
        valid_people = ["Emily Turner", "Isabella Anderson", "James Lee", "Amelia Rodriguez", "Lucas Hernandez"]
        response = chat_driver.ask_openai("Which personnel are assigned to the north area? use the ask_hr_by_params function")
        error_count = 0
        for person in valid_people:
            try:
                assert person in response['text'][0], self.log_assert(f"HR_by_params_by_area: Expected {person} to be in response.")
            except AssertionError:
                error_count += 1
        for person in self.hr:
            if person not in valid_people:
                assert person not in response['text'][0], self.log_assert(f"HR_by_params_by_area: Expected {person} to not be in response")
        if error_count > 0:
            self.log_assert(f'{response}')
            pytest.fail(f"HR_by_parmas_by_area: {error_count} errors. See log for details.")
        self.teardown_class()
    
    def test_redis(self):
        for i in range(25):
            print(i)
            timer = Timer(name="TestCodeTime-redis")
            timer.start()
            self.test_ask_hr_by_params_by_area()
            timer.stop()
            TestCodeTime.logger.info(f"TestCodeTime:: {format_timespan(timer.last)}")
            time.sleep(11)



