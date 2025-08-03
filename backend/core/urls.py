from django.urls import path
from core.views import (
    UploadPDFView,
    SendToGeminiView,
    RAGProcessView,
    CustomRegisterView,
    CustomLoginView,
    MyPDFsView
)
from django.conf import settings
from django.conf.urls.static import static





urlpatterns = [
    path('register-kullanici/', CustomRegisterView.as_view(), name='register_custom_user'),
    path('upload-pdf/', UploadPDFView.as_view(), name='upload_pdf'),
    path('send-to-gemini/', SendToGeminiView.as_view(), name='send_to_gemini'),
    path('rag-process/', RAGProcessView.as_view(), name='rag_process'),
    path('login-kullanici/', CustomLoginView.as_view(), name='login_custom_user'),
    path('my-pdfs/', MyPDFsView.as_view(), name='my_pdfs'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
