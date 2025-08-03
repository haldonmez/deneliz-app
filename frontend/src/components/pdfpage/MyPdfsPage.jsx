  import React, { useEffect, useState } from 'react';
  import Navbar from '../navbar/Navbar';
  import './MyPdfsPage.css';

  const MyPdfsPage = () => {
    const [pdfs, setPdfs] = useState([]);
    const username = localStorage.getItem('username');

    useEffect(() => {
      const fetchPDFs = async () => {
        try {
          const response = await fetch(`http://localhost:8000/api/my-pdfs/?username=${username}`);
          const data = await response.json();
          setPdfs(data);
        } catch (error) {
          console.error("PDF'ler alınamadı:", error);
        }
      };

      if (username) {
        fetchPDFs();
      }
    }, [username]);

    return (
      <div className="mypdf-container">
        <Navbar />
        <div className="mypdf-content">
          <h2 className="mypdf-title">{username} kullanıcısına ait PDF'ler</h2>
          {pdfs.length === 0 ? (
            <p className="no-pdf">Henüz hiç PDF yüklenmemiş.</p>
          ) : (
            <ul className="pdf-list">
              {pdfs.map((pdf) => (
                <li key={pdf.id} className="pdf-item">
                  <a
                    href={`http://localhost:8000/${pdf.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pdf-link"
                  >
                    📄 {pdf.filename}
                  </a>
                  <span className="upload-date">
                    {new Date(pdf.uploaded_at).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  };

  export default MyPdfsPage;
