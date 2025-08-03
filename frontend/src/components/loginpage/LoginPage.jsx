import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import Navbar from '../navbar/Navbar';
import NavbarLogo from '../NavbarLogo';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!username || !password) {
            alert("Kullanıcı adı veya şifre eksik!");
            return;
        }

        try {
            const response = await fetch("http://localhost:8000/api/login-kullanici/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("username", data.username);
                console.log('Giriş başarılı:', data.username);
                navigate('/');
            } else {
                alert("Hata: " + (data.message || "Giriş başarısız"));
            }
        } catch (error) {
            console.error("Sunucuya bağlanılamadı:", error);
            alert("Sunucuya bağlanılamadı.");
        }
    };

    return (
        <div className="uygulama">
            <Navbar />
            <div className="login-container">
                <div className="login-title">
                    <NavbarLogo />
                </div>
                <form onSubmit={handleLogin} className="login-form">
                    <input
                        type="text"
                        placeholder="Kullanıcı Adı"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Şifre"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button className="login-button" type="submit">Giriş Yap</button>
                    <p className="signup-link" onClick={() => navigate('/registerpage')}>
                        Hesabınız yok mu? Kayıt Ol
                    </p>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;
