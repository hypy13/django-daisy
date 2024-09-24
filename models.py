from datetime import datetime

from django.db import models
from django.db.models import Q
from django.utils.translation import gettext_lazy as _


class PublishedQuerySet(models.QuerySet):
    def published(self):
        return self.filter(
            Q(publication_date__lte=datetime.today()) | Q(publication_date__isnull=True),
        )


class PublishableModel(models.Model):
    publication_date = models.DateField(blank=True, null=True, default=datetime.now, verbose_name=_('publish date'))

    objects = PublishedQuerySet.as_manager()

    class Meta:
        abstract = True

    @property
    def is_visible(self):
        return self.publication_date is None or self.publication_date <= datetime.today()
