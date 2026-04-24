from django.db import models

class PendingUpload(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]
    TYPE_CHOICES = [
        ("bolts", "Bolts"),
        ("tests", "Tests"),
        ("curves", "Curves"),
    ]

    filename = models.CharField(max_length=255)
    data_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    file_content = models.JSONField(null=True, blank=True)  # stores parsed JSON
    csv_content = models.TextField(null=True, blank=True)   # stores raw CSV text
    test_id = models.IntegerField(null=True, blank=True)    # for curve uploads
    records_parsed = models.IntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.filename} ({self.status})"