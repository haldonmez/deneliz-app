import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Gemini.css';

function Gemini() {
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const handleAnalyzeClick = () => {
        fileInputRef.current.click();
    };

    const handleImageChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('pdf', selectedFile);
        formData.append("username", localStorage.getItem("username"));

        try {
            // 1. PDF yüklemesi
            const res = await fetch('http://localhost:8000/api/upload-pdf/', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) {
                throw new Error(`Upload failed: ${res.status} ${res.statusText}`);
            }

            const data = await res.json();

            if (!data.folder) {
                throw new Error('Sunucudan geçerli bir klasör adı alınamadı.');
            }

            const folder = data.folder;

            // 2. Gemini çözüm çağrısı
            const geminiRes = await fetch('http://localhost:8000/api/send-to-gemini/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ folder })
            });

            if (!geminiRes.ok) {
                throw new Error(`Gemini processing failed: ${geminiRes.status} ${geminiRes.statusText}`);
            }

            const geminiData = await geminiRes.json();
            console.log("Gemini dönüşü:", geminiData);

            // ✅ Hatalı olan bu satır düzeltildi:
            navigate('/response', { state: { response: geminiData } });

        } catch (error) {
            console.error('Upload or Gemini error:', error);
            alert(`Hata oluştu: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-container">
            <div className="upload-section">
                <button
                    onClick={handleAnalyzeClick}
                    disabled={loading}
                    className="upload-button"
                >
                    {loading ? 'İşleniyor...' : 'PDF Yükle ve Çöz'}
                </button>
                <input
                    type="file"
                    accept="application/pdf"
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                    onChange={handleImageChange}
                />
            </div>
        </div>
    );
}

export default Gemini;
