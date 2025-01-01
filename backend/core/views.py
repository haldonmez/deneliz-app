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


from pdf2image import convert_from_path
from pathlib import Path
import fitz  # PyMuPDF
import os

class UploadPDFView(APIView):
    def post(self, request):
        """Handle the PDF file upload and conversion"""
        try:
            if "pdf" not in request.FILES:
                return Response(
                    {"error": "No file uploaded"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            uploaded_pdf = request.FILES["pdf"]
            
            # Validate file type
            if not uploaded_pdf.name.endswith('.pdf'):
                return Response(
                    {"error": "File must be a PDF"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create base uploads directory
            upload_dir = os.path.join(settings.MEDIA_ROOT, "uploads")
            os.makedirs(upload_dir, exist_ok=True)
            
            # Create folder for this specific PDF (use filename without extension)
            pdf_name = os.path.splitext(uploaded_pdf.name)[0]
            pdf_folder = os.path.join(upload_dir, pdf_name)
            os.makedirs(pdf_folder, exist_ok=True)
            
            # Save the original PDF
            pdf_path = os.path.join(pdf_folder, uploaded_pdf.name)
            with open(pdf_path, "wb+") as destination:
                for chunk in uploaded_pdf.chunks():
                    destination.write(chunk)
            
            # Convert PDF to images
            pdf_document = fitz.open(pdf_path)
            image_paths = []
            
            for page_number in range(pdf_document.page_count):
                page = pdf_document[page_number]
                
                # Get the pixel map (higher zoom factor = higher resolution)
                pix = page.get_pixmap(matrix=fitz.Matrix(300/72, 300/72))  # 300 DPI
                
                image_filename = f'page_{page_number + 1}.jpg'
                image_path = os.path.join(pdf_folder, image_filename)
                
                # Save the image
                pix.save(image_path)
                image_paths.append(image_path)
            
            pdf_document.close()
            
            return Response({
                "message": "PDF uploaded and converted successfully",
                "pdf_path": pdf_path,
                "image_paths": image_paths,
                "total_pages": len(image_paths)
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Error during processing: {str(e)}")  # Debugging log
            return Response({
                "error": f"Processing failed: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)