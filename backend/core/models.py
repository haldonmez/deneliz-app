# core/models.py

from django.db import models
from django.conf import settings

class UploadedPDF(models.Model):
    folder_id = models.CharField(max_length=255)
    original_file = models.FileField(upload_to='uploads/')
    created_at = models.DateTimeField(auto_now_add=True)

    
    user = models.ForeignKey('CustomKullanici', on_delete=models.CASCADE, related_name='pdfs')

    def __str__(self):
        return f"PDF - {self.original_file.name}"


class ProcessedImage(models.Model):
    pdf = models.ForeignKey(UploadedPDF, on_delete=models.CASCADE, related_name='images')
    image_file = models.ImageField(upload_to='uploads/')
    gemini_response = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image - {self.image_file.name}"
    from django.db import models

class CustomKullanici(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField(unique=True)
    student_class = models.CharField(max_length=50)
    password = models.CharField(max_length=128)  # Şifreyi düz metin yerine hash'li de yapabiliriz

    def __str__(self):
        return self.username

