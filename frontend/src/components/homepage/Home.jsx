import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../navbar/Navbar';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();

    // Function to handle button click and navigate to /exam
    const handleStartClick = () => {
        navigate('/exam');
    };

    return (
        <div className="navbar-container">
            <Navbar />
            <div className="home-container">
                <header className="hero-section">
                    <h1>Hedeflerine Ulaşmanın Zamanı!</h1>
                    <p>Başarıya doğru emin adımlarla ilerleyin. Eksiklerinizi keşfedin ve güçlendirin!</p>
                    <button className="cta-button" onClick={handleStartClick}>Hemen Başla</button>
                </header>
                <section className="motivational-section">
                    <div className="motive-card">
                        <h2>Bilgi Analizleri</h2>
                        <p>Yaptığınız soruların analizleriyle eksiklerinizi görün ve bilgi seviyenizi artırın.</p>
                    </div>
                    <div className="motive-card">
                        <h2>Gelişim Adımları</h2>
                        <p>Her sorunun ardından analizlerle ilerlemenizi takip edin. Başarıya giden yolda adımlarınızı güçlendirin!</p>
                    </div>
                    <div className="motive-card">
                        <h2>Hedefe Ulaşma</h2>
                        <p>Yanlış yaptığınız konuları belirleyin, eksiklerinizi tamamlayarak başarıya ulaşın.</p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Home;