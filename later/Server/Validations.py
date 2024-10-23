'''Validates parameters passed to the API.'''
import inspect
import json
from Utilities import unexpected
from ErrorLogger import ErrorLogger
from PrepareRedis import get_redis_connection
from Constants import Constants

class Validations:
    '''Provides functions for validating data.'''

    def __init__(self, client, db):
        self.client = client
        self.db = db
        self.redis = get_redis_connection()
        self.log = ErrorLogger("Validations.log")
        self.logger = self.log.get_logger()

    def validate_certification(self, certification):
        '''Validate the certification.'''
        # A mongo db query that returns a list of certifications
        certifications = self.db["Certifications"].distinct("certification")
        if certification not in certifications:
            return False, f'Invalid certification: {certification}. Valid certifications are: {str(certifications)}'
        return True, None

    #pylint: disable=inconsistent-return-statements
    def get_distinct_variables(self, collection, var_name):
        '''Get the distinct variables.'''
        # Check if the variables are in redis
        key = var_name+collection # key is the variable name + collection name to avoid collisions
        try:
            if self.redis.exists(key):
                results = self.redis.get(key).decode('utf-8')
                if isinstance(results, str):
                    if not unexpected(results):
                        return results
                if isinstance(results, (dict, list)):
                    if len(results) > 0:
                        return results
            # A mongo db query that returns a list of variables
            variables = self.db[collection].distinct(var_name)
            # Store the variables in redis
            self.redis.set(key, json.dumps(variables), ex=3600*24)
            return variables
        except ConnectionError as e:
            if "6380" in e.args[0]:
                self.logger.error(f'get_distinct_variables: {e}')
                # A mongo db query that returns a list of variables
                try:
                    variables = self.db[collection].distinct(var_name)
                    return variables
                except Exception as err: #pylint: disable=broad-except
                    self.logger.error(f'get_distinct_variables: {err}')
                    return []
        except Exception as e: #pylint: disable=broad-except
            self.logger.error(f'get_distinct_variables: {e}')
            return []

    def validate_variables(self, collection, **kwargs):
        '''Validate the variable.'''
        no_check_validation = ["everything", "number_of_results", "distinct"]
        no_check_validation.extend(Constants.config['special_processing'])
        invalid_variables = {}
        for key, value in kwargs.items():
            if key in no_check_validation:
                continue
            if value is not None:
                valid, error, var_name = self._validate_variable_helper(collection, key, value)
                if not valid:
                    invalid_variables[var_name] = error
        if len(invalid_variables) > 0:
            return False, json.dumps(invalid_variables)
        return True, None

    def _validate_variable_helper(self, collection, key, value):
        # get the distinct variables
        variables = self.get_distinct_variables(collection, key)
        if variables is None:
            return True, None, key # We're going to try the value anyway because something went wrong with the db
        if value not in variables:
            return False, f'Invalid {value}. Valid {key} are: {str(variables)}', key
        return True, None, key

    def get_var_name(self, var):
        """
        Returns the name of the variable passed as an argument.
        """
        for name, value in inspect.currentframe().f_back.f_locals.items():
            if value is var:
                return name
        return None
