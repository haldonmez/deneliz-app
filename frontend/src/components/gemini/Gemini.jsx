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
        if (!selectedFile) {
            console.log('No file selected');
            return;
        }

        // Log file details for debugging
        console.log('Selected file:', {
            name: selectedFile.name,
            type: selectedFile.type,
            size: selectedFile.size
        });

        setLoading(true);

        const formData = new FormData();
        formData.append('pdf', selectedFile);

        try {
            const apiUrl = 'http://localhost:8000/api/upload-pdf/';
            console.log('Starting upload to:', apiUrl);

            const res = await fetch(apiUrl, {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });

            // Log the full response for debugging
            console.log('Response status:', res.status);
            console.log('Response headers:', Object.fromEntries(res.headers.entries()));

            // Try to get response body regardless of status
            let responseText;
            try {
                responseText = await res.text();
                console.log('Response body:', responseText);
            } catch (e) {
                console.log('Could not read response body:', e);
            }

            if (!res.ok) {
                throw new Error(`Upload failed: ${res.status} ${res.statusText}\n${responseText || ''}`);
            }

            // Try to parse JSON only if we got a successful response
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('Error parsing JSON response:', e);
                throw new Error('Invalid response format from server');
            }

            console.log('Upload successful:', data);
            navigate('/response', { state: { response: data.response } });

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
                <button onClick={handleAnalyzeClick} disabled={loading}>
                    {loading ? 'PDF Yükleniyor...' : 'PDF Yükle'}
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