from setuptools import setup, find_packages

setup(
  name="ChatServer",
  version="1.0",
  packages=[find_packages(), "/FileProcessor"],
  include_package_data=True
)
