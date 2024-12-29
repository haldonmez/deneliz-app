from django.urls import path
from .views import RAGProcessView
from .views import UploadPDFView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('rag-process/', RAGProcessView.as_view(), name='rag_process'),
    path('upload-pdf/', UploadPDFView.as_view(), name='upload_pdf'),  # Add the PDF upload endpoint
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
