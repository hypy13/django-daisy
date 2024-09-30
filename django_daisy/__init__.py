from importlib.metadata import version, PackageNotFoundError

try:
    __version__ = version("django_daisy")
except PackageNotFoundError:
    # package is not installed
    pass
