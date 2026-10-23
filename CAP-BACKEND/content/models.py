from django.db import models


class ThematicArea(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    icon = models.CharField(max_length=100, blank=True)
    summary = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']


class KeyStat(models.Model):
    thematic_area = models.ForeignKey(ThematicArea, on_delete=models.CASCADE, related_name='key_stats')
    label = models.CharField(max_length=150)
    value = models.CharField(max_length=150)


class Challenge(models.Model):
    thematic_area = models.ForeignKey(ThematicArea, on_delete=models.CASCADE, related_name='challenges')
    text = models.CharField(max_length=255)


class PCMCAction(models.Model):
    STATUS_CHOICES = [
        ('planned', 'Planned'),
        ('ongoing', 'Ongoing'),
        ('done', 'Done'),
    ]

    thematic_area = models.ForeignKey(ThematicArea, on_delete=models.CASCADE, related_name='pcmc_actions')
    text = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planned')
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']


class CitizenAction(models.Model):
    thematic_area = models.ForeignKey(ThematicArea, on_delete=models.CASCADE, related_name='citizen_actions')
    text = models.CharField(max_length=255)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']


class VulnerableGroup(models.Model):
    thematic_area = models.ForeignKey(ThematicArea, on_delete=models.CASCADE, related_name='vulnerable_groups')
    text = models.CharField(max_length=255)