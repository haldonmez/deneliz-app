from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import JSONParser, MultiPartParser
from rest_framework import status, generics
from rest_framework.permissions import AllowAny
from django.conf import settings
from django.contrib.auth import authenticate
from pathlib import Path
from .models import UploadedPDF, ProcessedImage, CustomKullanici
from .serializers import CustomKullaniciSerializer
from google.generativeai import configure, GenerativeModel
import fitz  # PyMuPDF
import os
import uuid
import logging
import cv2
from PIL import Image, ImageEnhance, ImageFilter
import numpy as np

logger = logging.getLogger(__name__)

# Gemini API ayarı
configure(api_key="AIzaSyAO06s-9uP6SaHOKfPcwWLPxUOL4Tch_Ao")
model = GenerativeModel("gemini-2.0-flash-exp")  # Using the latest model with vision

def enhance_image_for_vision(image_path, output_path=None):
    """Görüntüyü Gemini Vision için optimize et"""
    try:
        # PIL ile resmi aç
        img = Image.open(image_path)
        
        # RGBA formatındaysa RGB'ye çevir
        if img.mode == 'RGBA':
            img = img.convert('RGB')
        
        # Görüntüyü büyüt (çok küçükse)
        width, height = img.size
        if width < 1024 or height < 1024:
            # En büyük kenarı 1500 pixel yapacak şekilde orantılı büyüt
            max_size = 1500
            ratio = min(max_size/width, max_size/height)
            new_size = (int(width * ratio), int(height * ratio))
            img = img.resize(new_size, Image.LANCZOS)
        
        # Kontrast artır
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(1.3)
        
        # Keskinlik artır
        enhancer = ImageEnhance.Sharpness(img)
        img = enhancer.enhance(1.2)
        
        # Parlaklık hafif ayarla
        enhancer = ImageEnhance.Brightness(img)
        img = enhancer.enhance(1.1)
        
        # Hafif gürültü azaltma filtresi
        img = img.filter(ImageFilter.MedianFilter(size=3))
        
        # Çıktı yolunu belirle
        if output_path is None:
            output_path = image_path.replace('.png', '_enhanced.jpg').replace('.jpg', '_enhanced.jpg')
        
        # Yüksek kalitede kaydet
        img.save(output_path, 'JPEG', quality=95, optimize=True)
        
        print(f"[✓] Görüntü geliştirildi: {output_path}")
        return output_path
        
    except Exception as e:
        logger.error(f"Görüntü geliştirme hatası: {e}")
        return image_path  # Hata durumunda orijinal dosyayı döndür

def analyze_image_with_gemini(image_path):
    """Geliştirilmiş görüntüyü Gemini ile analiz et"""
    try:
        # Görüntüyü geliştir
        enhanced_path = enhance_image_for_vision(image_path)
        
        # Görüntüyü Gemini için hazırla
        img = Image.open(enhanced_path)
        
        # Detaylı prompt
        prompt = """
Bu bir sınav sayfasının görüntüsüdür. Lütfen bu sayfayı çok dikkatli bir şekilde analiz et ve şunları yap:

1. Sayfadaki TÜM soruları tespit et (numaralı, harfli, ya da işaretli olsun)
2. Her bir soruyu ayrı ayrı analiz et
3. Matematiksel formüller, diyagramlar, şekiller varsa bunları da dahil et
4.Ayrıca, her bir sorunun işaretlenmiş cevabını tespit etmeye çalış. Eğer işaretlenmiş bir şık varsa, aşağıdaki alanı da ekle:İşaretli Cevabı boş olarak döndür.



HER SORU İÇİN şu formatı kullan:

**SORU [NUMARA]**
**Soru Metni**: [Sorunun tam metni - matematiksel ifadeler, şekil açıklaması dahil]
**Soru Tipi**: [Çoktan seçmeli, Açık uçlu, Doğru-Yanlış, vb.]
**Seçenekler**: [Varsa A, B, C, D seçenekleri]
**Ana Konu**: [Matematik, Fizik, Kimya, vb.]
**Alt Konu**: [Daha spesifik konu: Türev, İntegral, Kuvvet, vb.]
**Zorluk Seviyesi**: [Kolay/Orta/Zor]
**Kazanımlar**: [Bu sorunun ölçtüğü beceriler]
**Çözüm Yaklaşımı**: [Bu soru nasıl çözülür onu madde madde anlat]
**Cevap**: [Sadece kendi çözümünden bulduğun şık harfi, örneğin: C ve devamına hiçbir ek getirme]
**İşaretli Cevap**: [Varsa, sadece şık harfi, örneğin: D ve devamına hiçbir ek getirme]

---

Eğer sayfada hiç soru yoksa "Bu sayfada soru bulunamadı" yaz.
Eğer sayfa bulanık veya okunamıyorsa "Sayfa kalitesi yetersiz" yaz.
Metnini veya bazı detaylarını tam anlayamadığın sorularda yaratıcılığını kullanıp en mantıklı şekilde doldurma yap.

Lütfen görüntüdeki her detayı dikkatlice incele ve hiçbir soruyu kaçırma.
"""

        # Gemini'ye gönder
        response = model.generate_content([prompt, img])
        
        # Geçici dosyayı temizle
        if enhanced_path != image_path:
            try:
                os.remove(enhanced_path)
            except:
                pass
        
        return response.text if hasattr(response, 'text') else str(response)
        
    except Exception as e:
        logger.error(f"Gemini görüntü analizi hatası: {e}")
        return f"Analiz hatası: {str(e)}"

def extract_high_quality_image_from_pdf(page, page_number, output_dir):
    """PDF sayfasından yüksek kaliteli görüntü çıkar"""
    try:
        # Çok yüksek çözünürlük için matrix
        matrix = fitz.Matrix(4.0, 4.0)  # 288 DPI (72*4)
        pix = page.get_pixmap(matrix=matrix)
        
        # Görüntü yolu
        image_filename = f"page_{page_number + 1}_hq.png"
        image_path = os.path.join(output_dir, image_filename)
        
        # PNG olarak kaydet (kalite kaybı olmasın)
        pix.save(image_path)
        
        print(f"[✓] Yüksek kaliteli görüntü oluşturuldu: {image_path}")
        return image_path
        
    except Exception as e:
        logger.error(f"Görükntü çıkarma hatası (Sayfa {page_number+1}): {e}")
        return None

class UploadPDFView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request):
        try:
            if "pdf" not in request.FILES:
                return Response({"error": "No file uploaded"}, status=400)

            username = request.data.get("username")
            if not username:
                return Response({"error": "username is required"}, status=400)

            try:
                kullanici = CustomKullanici.objects.get(username=username)
            except CustomKullanici.DoesNotExist:
                return Response({"error": "Kullanıcı bulunamadı"}, status=404)

            uploaded_pdf = request.FILES["pdf"]
            if not uploaded_pdf.name.endswith(".pdf"):
                return Response({"error": "File must be a PDF"}, status=400)

            folder_id = uuid.uuid4().hex
            upload_dir = os.path.join(settings.MEDIA_ROOT, "uploads", folder_id)
            os.makedirs(upload_dir, exist_ok=True)

            pdf_path = os.path.join(upload_dir, uploaded_pdf.name)
            with open(pdf_path, "wb+") as destination:
                for chunk in uploaded_pdf.chunks():
                    destination.write(chunk)

            uploaded_pdf_record = UploadedPDF.objects.create(
                folder_id=folder_id,
                original_file=f"uploads/{folder_id}/{uploaded_pdf.name}",
                user=kullanici
            )

            return Response({
                "message": "PDF başarıyla yüklendi.",
                "folder": folder_id
            }, status=200)

        except Exception as e:
            logger.error(f"PDF yükleme hatası: {str(e)}")
            return Response({"error": f"Processing failed: {str(e)}"}, status=500)


class SendToGeminiView(APIView):
    parser_classes = [JSONParser]

    def post(self, request):
        try:
            folder = request.data.get("folder")
            if not folder:
                return Response({"error": "folder is required"}, status=400)

            pdf_dir = Path(settings.MEDIA_ROOT) / "uploads" / folder
            if not pdf_dir.exists():
                return Response({"error": "Folder not found"}, status=404)

            pdf_file = next(pdf_dir.glob("*.pdf"), None)
            if not pdf_file:
                return Response({"error": "PDF file not found in folder"}, status=404)

            # Analiz sonuçları için dizin
            analysis_dir = pdf_dir / "analysis"
            analysis_dir.mkdir(exist_ok=True)

            pdf_doc = fitz.open(str(pdf_file))
            all_pages = []

            print(f"[INFO] PDF açıldı: {len(pdf_doc)} sayfa bulundu")

            for page_number in range(len(pdf_doc)):
                page = pdf_doc[page_number]
                
                print(f"[INFO] Sayfa {page_number + 1} işleniyor...")
                
                # Yüksek kaliteli görüntü çıkar
                image_path = extract_high_quality_image_from_pdf(
                    page, page_number, str(analysis_dir)
                )
                
                if not image_path or not os.path.exists(image_path):
                    print(f"[!] Sayfa {page_number + 1} için görüntü oluşturulamadı")
                    all_pages.append({
                        "page": f"Sayfa {page_number + 1}",
                        "error": "Görüntü oluşturulamadı",
                        "content": ""
                    })
                    continue

                # Gemini ile analiz et
                print(f"[INFO] Sayfa {page_number + 1} Gemini ile analiz ediliyor...")
                
                try:
                    analysis_result = analyze_image_with_gemini(image_path)
                    
                    if analysis_result:
                        print(f"[✓] Sayfa {page_number + 1} başarıyla analiz edildi")
                        all_pages.append({
                            "page": f"Sayfa {page_number + 1}",
                            "content": analysis_result,
                            "image_path": os.path.relpath(image_path, settings.MEDIA_ROOT).replace("\\", "/"),
                            "analysis_method": "Gemini Vision"
                        })
                    else:
                        print(f"[!] Sayfa {page_number + 1} için Gemini'den sonuç alınamadı")
                        all_pages.append({
                            "page": f"Sayfa {page_number + 1}",
                            "error": "Gemini analizi boş sonuç döndü",
                            "content": ""
                        })
                        
                except Exception as gemini_error:
                    logger.error(f"Gemini analiz hatası (Sayfa {page_number+1}): {gemini_error}")
                    all_pages.append({
                        "page": f"Sayfa {page_number + 1}",
                        "error": f"Gemini hatası: {str(gemini_error)}",
                        "content": ""
                    })

            pdf_doc.close()

            # Debug için sonuçları yazdır
            import json
            print("\n[DEBUG] --- GEMINI VİSİON ANALİZ SONUCU ---")
            print(json.dumps({
                "total_pages": len(all_pages),
                "results": all_pages
            }, indent=2, ensure_ascii=False))
            print("[DEBUG] --- SONU ---\n")
            
            return Response({
                "total_pages": len(all_pages),
                "results": all_pages,
                "analysis_method": "Gemini Vision Direct"
            }, status=200)

        except Exception as e:
            logger.error(f"Genel hata (Gemini Vision): {str(e)}")
            return Response({"error": f"Internal Server Error: {str(e)}"}, status=500)

# Diğer view'lar aynı kalıyor...
class RAGProcessView(APIView):
    parser_classes = [JSONParser]

    def get(self, request):
        return Response({"status": "Service is running"}, status=200)

class CustomRegisterView(generics.CreateAPIView):
    queryset = CustomKullanici.objects.all()
    serializer_class = CustomKullaniciSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        print(f"[✓] Yeni CustomKullanici oluşturuldu: {user.username}")

class CustomLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        try:
            user = CustomKullanici.objects.get(username=username)
        except CustomKullanici.DoesNotExist:
            return Response({"message": "Kullanıcı bulunamadı"}, status=400)

        if user.password == password:
            return Response({"message": "Giriş başarılı", "username": user.username}, status=200)
        else:
            return Response({"message": "Şifre yanlış"}, status=400)

class MyPDFsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        username = request.query_params.get("username")
        if not username:
            return Response({"error": "username is required"}, status=400)

        try:
            user = CustomKullanici.objects.get(username=username)
        except CustomKullanici.DoesNotExist:
            return Response({"error": "Kullanıcı bulunamadı"}, status=404)

        pdfs = UploadedPDF.objects.filter(user=user).order_by('-created_at')
        data = [
            {
                "id": pdf.id,
                "filename": os.path.basename(pdf.original_file.name),
                "url": pdf.original_file.url,
                "uploaded_at": pdf.created_at
            }
            for pdf in pdfs
        ]
        return Response(data, status=200)