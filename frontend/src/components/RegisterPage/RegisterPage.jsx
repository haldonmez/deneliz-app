import React, { useState } from 'react';
import './RegisterPage.css';
import Navbar from '../navbar/Navbar';
import { useNavigate } from 'react-router-dom';



function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    email: '',
    class: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8000/api/register-kullanici/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          student_class: formData.class,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Kayıt başarılı!");
        console.log("Sunucudan gelen cevap:", data);
        navigate('/loginpage'); 
      } else {
        alert("Kayıt başarısız: " + (data.message || "Hata oluştu."));
      }
    } catch (error) {
      console.error("Sunucuya bağlanılamadı:", error);
      alert("Sunucu hatası oluştu.");
    }
  };

  return (
    <div className="register-container">
      <Navbar />
      <div className="register-box">
        <h2 className="register-title">Kayıt Ol</h2>
        <form onSubmit={handleSubmit} className="register-form">
          <input
            type="text"
            name="firstName"
            placeholder="İsim"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder="Soyisim"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="username"
            placeholder="Kullanıcı Adı"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="E-posta"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="class"
            placeholder="Sınıf"
            value={formData.class}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Şifre"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit">Kayıt Ol</button>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
