# core/admin.py

from django.contrib import admin
from .models import UploadedPDF, ProcessedImage

from django.contrib import admin
from .models import CustomKullanici

admin.site.register(CustomKullanici)


@admin.register(UploadedPDF)
class UploadedPDFAdmin(admin.ModelAdmin):
    list_display = ('id', 'folder_id', 'original_file', 'created_at')
    search_fields = ('folder_id',)

@admin.register(ProcessedImage)
class ProcessedImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'pdf', 'image_file', 'created_at')
    search_fields = ('pdf__folder_id',)
