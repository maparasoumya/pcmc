from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    ROLE_CHOICES = [
        ('pcmc_staff', 'PCMC Staff'),
        ('super_admin', 'Super Admin'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='pcmc_staff', blank=True)
    department = models.CharField(max_length=100, blank=True)