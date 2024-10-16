from importlib.metadata import version, PackageNotFoundError

from django.contrib.admin.decorators import action, display, register
from django.contrib.admin.filters import (
    AllValuesFieldListFilter,
    BooleanFieldListFilter,
    ChoicesFieldListFilter,
    DateFieldListFilter,
    EmptyFieldListFilter,
    FieldListFilter,
    ListFilter,
    RelatedFieldListFilter,
    RelatedOnlyFieldListFilter,
    SimpleListFilter,
)
from django.contrib.admin.options import (
    HORIZONTAL,
    VERTICAL,
    ModelAdmin,
    ShowFacets,
    StackedInline,
    TabularInline,
)
from django.contrib.admin.sites import AdminSite
from django.contrib.admin.sites import site as admin_site
from django.utils.functional import LazyObject
from django.utils.module_loading import autodiscover_modules, import_string


class DefaultAdminSite(LazyObject):
    def _setup(self):
        AdminSiteClass = import_string('django_daisy.admin.DaisyAdminSite')
        self._wrapped = AdminSiteClass()

    def __repr__(self):
        return repr(self._wrapped)


site = DefaultAdminSite()

__all__ = [
    "action",
    "display",
    "register",
    "ModelAdmin",
    "HORIZONTAL",
    "VERTICAL",
    "StackedInline",
    "TabularInline",
    "AdminSite",
    "ListFilter",
    "SimpleListFilter",
    "FieldListFilter",
    "BooleanFieldListFilter",
    "RelatedFieldListFilter",
    "ChoicesFieldListFilter",
    "DateFieldListFilter",
    "AllValuesFieldListFilter",
    "EmptyFieldListFilter",
    "RelatedOnlyFieldListFilter",
    "ShowFacets",
    "autodiscover",
]


def autodiscover():
    # autodiscover_modules("django_daisy", register_to=site)
    autodiscover_modules("admin", register_to=admin_site)


try:
    __version__ = version("django_daisy")
except PackageNotFoundError:
    # package is not installed
    pass
