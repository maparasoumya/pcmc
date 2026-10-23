from django.db import models


class Indicator(models.Model):
    name = models.CharField(max_length=200)
    thematic_area = models.ForeignKey(
        'content.ThematicArea',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='indicators'
    )
    unit = models.CharField(max_length=50)
    target_value = models.DecimalField(max_digits=12, decimal_places=2)
    target_date = models.DateField(null=True, blank=True)


class ProgressEntry(models.Model):
    indicator = models.ForeignKey(Indicator, on_delete=models.CASCADE, related_name='entries')
    actual_value = models.DecimalField(max_digits=12, decimal_places=2)
    reported_date = models.DateField()
    recorded_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True)
    remarks = models.TextField(blank=True)

    class Meta:
        ordering = ['-reported_date']


class ClimateActionCellMeeting(models.Model):
    meeting_date = models.DateField()
    held = models.BooleanField(default=False)
    minutes_link = models.URLField(blank=True)

    class Meta:
        ordering = ['-meeting_date']