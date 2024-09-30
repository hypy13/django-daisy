import subprocess

from setuptools import setup, find_packages


def get_version():
    try:
        # Run the git describe command to get the latest tag
        version = subprocess.check_output(["git", "describe", "--tags", "--abbrev=0"]).strip().decode('utf-8')
    except subprocess.CalledProcessError:
        # If there is an error (e.g., no git or no tags), fall back to a default version
        version = "0.0.1"

    return version


setup(
    name='django_daisy',
    version=get_version(),
    packages=find_packages(),
    include_package_data=True,
    install_requires=[],  # Add dependencies here
    description='A modern django dashboard built with daisyui',
    long_description=open('README.md').read(),
    long_description_content_type='text/markdown',
    url='https://github.com/hypy13/django-daisy',
    author='Hossein Yaghoubi',
    author_email='hossein.yaghoubi13@gmail.com',
    license='Apache 2.0',
    classifiers=[
        'Programming Language :: Python :: 3',
        'License :: OSI Approved :: Apache Software License',
        'Operating System :: OS Independent',
    ],
)
