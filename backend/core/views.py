# core/views.py

from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import JSONParser
from django.conf import settings
from rest_framework import status
from .ai_service import AIService
import logging
import os

logger = logging.getLogger(__name__)

class RAGProcessView(APIView):
    parser_classes = [JSONParser]

    def get(self, request):
        """Health check endpoint"""
        return Response({"status": "Service is running"}, status=status.HTTP_200_OK)

    def post(self, request):
        """Process RAG request"""
        try:
            # Ensure AIService is initialized
            ai_service = AIService()
            if not ai_service._initialized:
                raise Exception("AIService has not been initialized properly.")

            qa_chain = ai_service.get_qa_chain()

            # Validate input
            data = request.data
            text = data.get("text")

            if not text:
                return Response(
                    {"error": "No text provided"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Prepare question
            question = f"""{text} Verilen Soru göz önünde bulunarak kazanımlarını tek tek her soru için belirle. ..."""

            # Process request
            result = qa_chain({"query": question})

            return Response({
                "result": result["result"],
                "status": "success"
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Processing error: {str(e)}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UploadPDFView(APIView):
    def post(self, request):
        """Handle the PDF file upload"""
        try:
            if "pdf" not in request.FILES:
                return Response(
                    {"error": "No file uploaded"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            uploaded_pdf = request.FILES["pdf"]
            
            # Ensure the uploads directory exists
            upload_dir = os.path.join(settings.MEDIA_ROOT, "uploads")
            os.makedirs(upload_dir, exist_ok=True)
            
            # Create the full file path
            file_path = os.path.join(upload_dir, uploaded_pdf.name)
            
            # Save the file using chunks
            with open(file_path, "wb+") as destination:
                for chunk in uploaded_pdf.chunks():
                    destination.write(chunk)
            
            print(f"File successfully saved to: {file_path}")  # Debugging log
            
            return Response({
                "message": "PDF uploaded successfully",
                "file_path": file_path
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Error during upload: {str(e)}")  # Debugging log
            return Response({
                "error": f"Upload failed: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get(self, request):
        """Handle GET requests"""
        return Response({
            "message": "This endpoint only accepts POST requests for file uploads"
        }, status=status.HTTP_405_METHOD_NOT_ALLOWED)