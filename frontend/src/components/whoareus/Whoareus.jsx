import React from 'react';
import Navbar from '../navbar/Navbar';
import './Whoareus.css';

const Whoareus = () => {
    return (
        <div className="whoareus-container">
            <Navbar />
            <div className="content">
                <h2 className="whoh2 animate-slide">Biz Kimiz ?</h2>
                <p className="whop animate-fade">
                    Biz eğitim odaklı bir platformuz. Kullanıcılarımız, deneme sınavı sonuçlarını bizimle paylaşabilirler.
                    Bu sonuçlar, Gemini yapay zekamız tarafından analiz edilerek kullanıcılarımıza özel geri bildirimler sağlanacaktır.
                </p>
                <h2 className="whoh2 animate-slide">Misyonumuz</h2>
                <p className="whop animate-fade">
                    Eğitimde erişilebilirliği artırmak ve her bireyin potansiyelini en üst düzeye çıkarmak için 
                    yenilikçi ve etkili çözümler sunmak.
                </p>
                <h2 className="whoh2 animate-slide">Vizyonumuz</h2>
                <p className="whop animate-fade">
                    Eğitim teknolojilerinde lider bir platform olmak ve her öğrencinin başarılı bir geleceğe ulaşmasını sağlamak.
                </p>
            </div>
        </div>
    );
};

export default Whoareus;
