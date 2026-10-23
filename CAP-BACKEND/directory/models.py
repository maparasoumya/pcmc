from django.db import models as m


class VendorCategory(m.Model):
    name = m.CharField(max_length=50)
    thematic_area = m.ForeignKey(
        'content.ThematicArea',
        on_delete=m.SET_NULL,
        null=True,
        blank=True
    )


class Vendor(m.Model):
    category = m.ForeignKey(
        VendorCategory,
        on_delete=m.PROTECT
    )
    name = m.CharField(max_length=50)
    phone_number = m.CharField(max_length=10)
    email = m.EmailField(unique=True)
    address = m.TextField()
    urlfield = m.URLField(blank=True)
    notes = m.TextField(blank=True)
    is_active = m.BooleanField(default=True)
    added_by = m.ForeignKey(
        'accounts.User',
        on_delete=m.SET_NULL,
        null=True
    )
