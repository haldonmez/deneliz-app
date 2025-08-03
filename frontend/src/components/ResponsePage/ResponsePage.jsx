import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../navbar/Navbar';
import './ResponsePage.css';

function ResponsePage() {
    const location = useLocation();
    const navigate = useNavigate();
    const response = location.state?.response?.results || [];
    const totalPages = location.state?.response?.total_pages || 0;

    const [collapsedPages, setCollapsedPages] = useState(
        Array(response.length).fill(true)
    );
    const [wrongAnswers, setWrongAnswers] = useState([]);
    const [collapsedWrong, setCollapsedWrong] = useState(true);

    useEffect(() => {
        const allWrongAnswers = [];

        response.forEach((page, pageIndex) => {
            if (typeof page.content === 'string') {
                const rawBlocks = page.content.split(/\*\*\s*SORU\s*\d+\s*\*\*/i).slice(1);

                rawBlocks.forEach((questionText, index) => {
                    const cevapMatch = questionText.match(/\*\*Cevap\*\*:\s*([^*]+?)(?=\*\*|$)/s);
                    const isaretliCevapMatch = questionText.match(/\*\*İşaretli Cevap\*\*:\s*([^*]+?)(?=\*\*|$)/s);
                    const soruMetniMatch = questionText.match(/\*\*Soru Metni\*\*:\s*([^*]+?)(?=\*\*|$)/s);
                    const anaKonuMatch = questionText.match(/\*\*Ana Konu\*\*:\s*([^*]+?)(?=\*\*|$)/s);
                    const altKonuMatch = questionText.match(/\*\*Alt Konu\*\*:\s*([^*]+?)(?=\*\*|$)/s);

                    const cevap = cevapMatch ? cevapMatch[1].replace(/[^A-E]/gi, '').trim() : 'N/A';
                    const isaretliCevap = isaretliCevapMatch ? isaretliCevapMatch[1].replace(/[^A-E]/gi, '').trim() : 'N/A';
                    const soruMetni = soruMetniMatch ? soruMetniMatch[1].trim() : 'N/A';
                    const anaKonu = anaKonuMatch ? anaKonuMatch[1].trim() : 'Yok';
                    const altKonu = altKonuMatch ? altKonuMatch[1].trim() : 'Yok';

                    const dogruMu =
                        isaretliCevap !== 'N/A' && cevap !== 'N/A'
                            ? isaretliCevap.toUpperCase() === cevap.toUpperCase()
                            : null;

                    if (dogruMu === false) {
                        allWrongAnswers.push({
                            sayfa: pageIndex + 1,
                            soruNo: index + 1,
                            soruMetni,
                            isaretliCevap,
                            cevap,
                            anaKonu,
                            altKonu
                        });
                    }
                });
            }
        });

        setWrongAnswers(allWrongAnswers);
    }, [response]);

    const toggleCollapse = (index) => {
        setCollapsedPages(prev => {
            const newCollapsed = [...prev];
            newCollapsed[index] = !newCollapsed[index];
            return newCollapsed;
        });
    };

    const toggleWrongCollapse = () => {
        setCollapsedWrong(prev => !prev);
    };

    const parseContent = (content) => {
        if (typeof content !== 'string') return [];

        const rawBlocks = content.split(/\*\*\s*SORU\s*\d+\s*\*\*/i).slice(1);

        return rawBlocks.map((questionText, index) => {
            const soruMetniMatch = questionText.match(/\*\*Soru Metni\*\*:\s*([^*]+?)(?=\*\*|$)/s);
            const soruTipiMatch = questionText.match(/\*\*Soru Tipi\*\*:\s*([^*]+?)(?=\*\*|$)/s);
            const seceneklerMatch = questionText.match(/\*\*Seçenekler\*\*:\s*([^*]+?)(?=\*\*|$)/s);
            const anaKonuMatch = questionText.match(/\*\*Ana Konu\*\*:\s*([^*]+?)(?=\*\*|$)/s);
            const altKonuMatch = questionText.match(/\*\*Alt Konu\*\*:\s*([^*]+?)(?=\*\*|$)/s);
            const zorlukMatch = questionText.match(/\*\*Zorluk Seviyesi\*\*:\s*([^*]+?)(?=\*\*|$)/s);
            const kazanımlarMatch = questionText.match(/\*\*Kazanımlar\*\*:\s*([^*]+?)(?=\*\*|$)/s);
            const cozumYaklasimMatch = questionText.match(/\*\*Çözüm Yaklaşımı\*\*:\s*([\s\S]*?)(?=\*\*Cevap\*\*|$)/);
            const cevapMatch = questionText.match(/\*\*Cevap\*\*:\s*([^*]+?)(?=\*\*|$)/s);
            const isaretliCevapMatch = questionText.match(/\*\*İşaretli Cevap\*\*:\s*([^*]+?)(?=\*\*|$)/s);

            const soruMetni = soruMetniMatch ? soruMetniMatch[1].trim() : 'N/A';
            const soruTipi = soruTipiMatch ? soruTipiMatch[1].trim() : 'N/A';
            const secenekler = seceneklerMatch ? seceneklerMatch[1].trim() : 'N/A';
            const anaKonu = anaKonuMatch ? anaKonuMatch[1].trim() : 'Yok';
            const altKonu = altKonuMatch ? altKonuMatch[1].trim() : 'Yok';
            const zorluk = zorlukMatch ? zorlukMatch[1].trim() : 'N/A';
            const kazanımlar = kazanımlarMatch ? kazanımlarMatch[1].trim().split(',') : [];
            const cozumYaklasim = cozumYaklasimMatch ? cozumYaklasimMatch[1].trim() : 'N/A';
            const cevap = cevapMatch ? cevapMatch[1].replace(/[^A-E]/gi, '').trim() || 'N/A' : 'N/A';
            const isaretliCevap = isaretliCevapMatch ? isaretliCevapMatch[1].replace(/[^A-E]/gi, '').trim() || 'N/A' : 'N/A';

            const dogruMu = isaretliCevap !== 'N/A' && cevap !== 'N/A'
                ? isaretliCevap.toUpperCase() === cevap.toUpperCase()
                : null;

            return (
                <li key={index} className="question-item">
                    <div className="question-header">
                        <h4>SORU {index + 1}</h4>
                    </div>
                    <div className="question-details">
                        <p><strong>Soru Metni:</strong> {soruMetni}</p>
                        <p><strong>Soru Tipi:</strong> {soruTipi}</p>
                        {secenekler !== 'N/A' && <p><strong>Seçenekler:</strong> {secenekler}</p>}
                        <p><strong>Ana Konu:</strong> {anaKonu}</p>
                        <p><strong>Alt Konu:</strong> {altKonu}</p>
                        <p><strong>Zorluk Seviyesi:</strong> {zorluk}</p>
                        <div className="kazanimlar-section">
                            <p><strong>Kazanımlar:</strong></p>
                            <ul className="kazanimlar-list">
                                {kazanımlar.map((k, i) => <li key={i}>{k.trim()}</li>)}
                            </ul>
                        </div>
                        {cozumYaklasim !== 'N/A' && <div className="cozum-section">
                            <p><strong>Çözüm Yaklaşımı:</strong></p>
                            <pre className="cozum-text">{cozumYaklasim}</pre>
                        </div>}
                        <p><strong>İşaretli Cevap:</strong> {isaretliCevap}</p>
                        <p><strong>Cevap:</strong> <span className="answer">{cevap}</span></p>
                        <p><strong>Durum:</strong>{' '}
                            {dogruMu === null ? <span style={{ color: 'gray' }}>Belirsiz</span> : dogruMu ? <span style={{ color: 'green', fontWeight: 'bold' }}>Doğru</span> : <span style={{ color: 'red', fontWeight: 'bold' }}>Yanlış</span>}
                        </p>
                    </div>
                </li>
            );
        });
    };

    return (
        <div className="uygulama">
            <Navbar />
            <h2 className="baslik">Sayfa Bazında Analiz Sonuçları</h2>
            <div className="summary-info">
                <p>Toplam Sayfa Sayısı: {totalPages}</p>
                <p>Analiz Edilen Sayfa Sayısı: {response.length}</p>
            </div>
            {response.length > 0 ? (
                <div className="kutu-container">
                    {response.map((page, pageIndex) => (
                        <div key={pageIndex} className="sayfa-alani">
                            <div className="card-header" onClick={() => toggleCollapse(pageIndex)}>
                                <h3>{page.page}</h3>
                                <div className="page-info">
                                    <span className="toggle-icon">
                                        {collapsedPages[pageIndex] ? '+' : '-'}
                                    </span>
                                </div>
                            </div>
                            {!collapsedPages[pageIndex] && (
                                <div className="card-content">
                                    {page.image_path && (
                                        <div className="image-section">
                                            <img src={page.image_path} alt={`Sayfa ${page.page}`} className="page-image" onError={(e) => e.target.style.display = 'none'} />
                                        </div>
                                    )}
                                    <ul className="question-list">
                                        {parseContent(page.content)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="no-response">
                    <p>No response available.</p>
                </div>
            )}

            {wrongAnswers.length > 0 && (
                <div className="wrong-summary">
                    <div className="card-header" onClick={toggleWrongCollapse}>
                        <h3>Yanlış Yapılan Sorular</h3>
                        <span className="toggle-icon">{collapsedWrong ? '+' : '-'}</span>
                    </div>
                    {!collapsedWrong && (
                        <ul>
                            {wrongAnswers.map((w, i) => (
                                <li key={i}>
                                    Sayfa {w.sayfa} - Soru {w.soruNo}: <strong>{w.soruMetni}</strong><br />
                                    → Doğru: {w.cevap}, İşaretli: {w.isaretliCevap}<br />
                                    Ana Konu: {w.anaKonu}, Alt Konu: {w.altKonu}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
            <button className="b" onClick={() => navigate(-1)}>Geri Dön</button>
        </div>
    );
}

export default ResponsePage;
