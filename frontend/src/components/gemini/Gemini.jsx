import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Gemini.css';

function Gemini() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const handleAnalyzeClick = () => {
        fileInputRef.current.click();
    };

    const handleImageChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('pdf', selectedFile);

        try {
            const apiUrl = 'http://localhost:8000/api/upload-pdf/';
            const res = await fetch(apiUrl, {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });

            if (!res.ok) {
                throw new Error(`Upload failed: ${res.status} ${res.statusText}`);
            }

            const data = await res.json();
            navigate('/response', { state: { response: data } });

        } catch (error) {
            console.error('Upload error:', error);
            alert(`Upload failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="App">
            <div className="container">
                <div className="line"></div>
                <button 
                    onClick={handleAnalyzeClick} 
                    disabled={loading}
                    className="upload-button">
                    {loading ? 'PDF İşleniyor...' : 'PDF Yükle'}
                </button>
                <div className="line"></div>
            </div>

            <input
                type="file"
                accept="application/pdf"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleImageChange}
            />
        </div>
    );
}

export default Gemini;