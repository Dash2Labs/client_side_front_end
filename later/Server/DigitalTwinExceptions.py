# Copyright 2023 Dash2Labs, LLC.  All rights reserved.
'''This file contains the exceptions used in the application.'''

class EmbeddingError(Exception):
    '''Exception raised when an embedding cannot be generated.'''
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        