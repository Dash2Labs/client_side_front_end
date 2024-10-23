# pylint: skip-file
import pytest
import sys
sys.path.append('../Server')
from humanfriendly import format_timespan
from ErrorLogger import ErrorLogger
from codetiming import Timer
from ChatDataProvider import ChatDataProvider
import inspect
from os.path import basename
import json

class TestChatDataProvider:
    '''Setup for code timing'''
    @pytest.fixture(autouse=True)
    def setup(self):
        self.timer = Timer(name="DataProvider")
        self.timer.start()
        yield
        self.timer.stop()
        self.get_logger().logger.info(f"DataProvider:: {format_timespan(self.timer.last)}")

    @pytest.fixture
    def chat_data_provider(self) -> ChatDataProvider:
        return ChatDataProvider()

    def get_logger(self) -> ErrorLogger:
        log = ErrorLogger("DataProvider.log")
        return log.get_logger()

    def log_assert(self, arg=None):
        caller = inspect.stack()[1]
        if arg is None:
            with open(caller[1], "r", encoding="utf-8") as source_code:
                for n, line in enumerate(source_code):
                    if n >= caller[2] - 1:
                        arg = line.strip
                    break
        if self.get_logger().logger is not None:
            self.get_logger().logger.error(f"{basename(caller[1])}:{caller[2]} - {caller[3]}] {arg}")

    def test_process_results_with_empty_results(self, chat_data_provider: ChatDataProvider):
        # Arrange
        results = []

        # Act
        processed_results = chat_data_provider._process_results(results)

        # Assert
        assert processed_results == []

    def test_process_results_with_results(self, chat_data_provider: ChatDataProvider):
        # Arrange
        results = [
            {
                "name": "John Doe",
                "age": 30,
                "dob": 1625097600000,  # July 1, 2021
                "effective": 1627776000000,  # August 1, 2021
                "expiration": 1630454400000,  # September 1, 2021
                "embedding": "1234567890"
            },
            {
                "name": "Jane Smith",
                "age": 25,
                "dob": 1619683200000,  # April 29, 2021
                "effective": 1622361600000,  # May 31, 2021
                "expiration": 1625039999000,  # June 30, 2021,
                "embedding": "0987654321"
            }
        ]

        # Act
        processed_results = chat_data_provider._process_results(results)

        # Assert
        assert len(processed_results) == 2
        assert processed_results[0]["name"] == "John Doe"
        assert processed_results[0]["dob"] == "2021-07-01 00:00:00"
        assert processed_results[0]["effective"] == "2021-08-01 00:00:00"
        assert processed_results[0]["expiration"] == "2021-09-01 00:00:00"
        assert processed_results[1]["name"] == "Jane Smith"
        assert processed_results[1]["dob"] == "2021-04-29 00:00:00"
        assert processed_results[1]["effective"] == "2021-05-31 00:00:00"
        assert processed_results[1]["expiration"] == "2021-06-30 23:59:59"
        assert "embedding" not in processed_results[0]
        assert "embedding" not in processed_results[1]
    
    def test_ask_hr_with_params(self, chat_data_provider: ChatDataProvider):
        response = chat_data_provider.ask_hr_with_params(area="North")
        response = json.dumps(response)
        assert response is not None
        assert response != ""
        assert "Emily Turner" in response
        assert "Isabella Anderson" in response
        assert "James Lee" in response
        assert "Amelia Rodriguez" in response
        assert "Lucas Hernandez" in response

    def test_get_weapons_with_parameters(self, chat_data_provider: ChatDataProvider):
        # Arrange
        parameters = {"model": "Glock 22"}

        # Act
        result = chat_data_provider.get_weapons(**parameters)

        # Assert
        assert len(result) == 5

    def test_get_K9_with_parameters(chat_data_provider: ChatDataProvider):
        # Arrange
        parameters = {"name": "Bart"}
        # Act
        result = chat_data_provider.get_K9(**parameters)
        # Assert
        assert len(result) == 1

    def test_get_vehicles_with_parameters(self, chat_data_provider: ChatDataProvider):
        # Arrange
        parameters = {"model": "Ford Explorer"}

        # Act
        result = chat_data_provider.get_vehicles(**parameters)

        # Assert
        assert len(result) == 3

    def test_get_crime_data_with_parameters(self, chat_data_provider: ChatDataProvider):
        # Arrange
        parameters = {"category": "Vehicle Theft", "date_range_match": ["2022-01-01", "2022-12-31", "date_of_offense"]}

        # Act
        result = chat_data_provider.get_crime_data(**parameters)

        # Assert
        assert len(result) == 20

    def test_get_certifications_with_parameters(self, chat_data_provider: ChatDataProvider):
        # Arrange
        parameters = {"certification": "NM Law Enforcement Certification"}

        # Act
        result = chat_data_provider.get_certifications(**parameters)

        # Assert
        assert len(result) == 25

    def test_get_sops_with_params(self, chat_data_provider: ChatDataProvider):
        # Arrange
        parameters = {"category": "Organization - Duties & Responsibilities", "title": "Abandoned Vehicle"}

        # Act
        result = chat_data_provider.get_sops(**parameters)

        # Assert
        assert len(result) == 1

    def test_get_sops_with_everything(self, chat_data_provider: ChatDataProvider):
        # Arrange
        parameters = {"everything": True}

        # Act
        result = chat_data_provider.get_sops(**parameters)

        # Assert
        assert len(result) == 98

    def test_process_date(self, chat_data_provider: ChatDataProvider):
        # Arrange
        value = "2022-01-01 12:00:00"

        # Act
        result = chat_data_provider._process_date(value)

        # Assert
        assert isinstance(result, int)
        assert result == 1641045600000

    def test_process_date_range_match(self, chat_data_provider: ChatDataProvider):
        # Arrange
        collection = []
        value = ["2022-01-01", "2022-12-31", "date_field"]
        pipeline = []

        # Act
        result_pipeline, _ = chat_data_provider._process_date_range_match(collection, value, pipeline)

        # Assert
        assert len(result_pipeline) == 1
        assert result_pipeline[0] == {
            "$match": {
                "date_field": {
                    "$gte": "2022-01-01",
                    "$lte": "2022-12-31"
                }
            }
        }
