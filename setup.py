from setuptools import setup, find_packages

from setuptools_scm import get_version

setup(
    name='django-daisy',
    version=get_version(),
    packages=find_packages(),
    use_scm_version=True,
    setup_requires=['setuptools-scm'],
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
