import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../navbar/Navbar';
import './ResponsePage.css';

function ResponsePage() {
    const location = useLocation();
    const navigate = useNavigate();
    const response = location.state?.response || [];

    console.log("Location state:", location.state);
    console.log("Response received:", response);

    const [collapsedPages, setCollapsedPages] = useState(
        Array(response.length).fill(true)
    );

    const toggleCollapse = (index) => {
        setCollapsedPages(prev => {
            const newCollapsed = [...prev];
            newCollapsed[index] = !newCollapsed[index];
            return newCollapsed;
        });
    };

    // Helper function to parse content string into structured questions
    const parseContent = (content) => {
        if (typeof content !== 'string') {
            console.error("Content is not a string:", content);
            return []; 
        }

        const questionBlocks = content.split("**Sayfa Numarası**").filter(q => q.trim() !== "");

        return questionBlocks.map((questionText, index) => {
            const soruNumarasiMatch = questionText.match(/\*\*Soru Numarası\*\*:\s*(\d+)/);
            const anaKonuMatch = questionText.match(/\*\*Ana Konu\*\*:\s*([^*]+)/);
            const altKonuMatch = questionText.match(/\*\*Alt Konu\*\*:\s*([^*]+)/);
            const kazanımlarMatch = questionText.match(/\*\*Kazanımlar\*\*:\s*([^*]+)/);

            const soruNumarasi = soruNumarasiMatch ? soruNumarasiMatch[1].trim() : "N/A";
            const anaKonu = anaKonuMatch ? anaKonuMatch[1].trim() : "N/A";
            const altKonu = altKonuMatch ? altKonuMatch[1].trim() : "N/A";
            const kazanımlar = kazanımlarMatch ? kazanımlarMatch[1].trim().split(',') : [];

            return (
                <li key={index} className="question-item">
                    <p><strong>Soru Numarası:</strong> {soruNumarasi}</p>
                    <p><strong>Ana Konu:</strong> {anaKonu}</p>
                    <p><strong>Alt Konu:</strong> {altKonu}</p>
                    <p><strong>Kazanımlar:</strong></p>
                    <ul>
                        {kazanımlar.map((kazanım, kazanımIndex) => (
                            <li key={kazanımIndex}>{kazanım.trim()}</li>
                        ))}
                    </ul>
                </li>
            );
        });
    };

    return (
        <div className="uygulama">
            <Navbar />
            <h2 className="baslik">Sayfa Bazında Analiz Sonuçları</h2>
            {response.length > 0 ? (
                <div className="kutu-container">
                    {response.map((page, pageIndex) => (
                        <div key={pageIndex} className="sayfa-alani">
                            <div className="card-header" onClick={() => toggleCollapse(pageIndex)}>
                                <h3>Sayfa Numarası: {page.page}</h3>
                                <span className="toggle-icon">
                                    {collapsedPages[pageIndex] ? '+' : '-'}
                                </span>
                            </div>
                            {!collapsedPages[pageIndex] && (
                                <div className="card-content">
                                    <ul className="question-list">
                                        {parseContent(page.content)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p>No response available.</p>
            )}
            <button className="b" onClick={() => navigate(-1)}>Geri Dön</button>
        </div>
    );
}

export default ResponsePage;