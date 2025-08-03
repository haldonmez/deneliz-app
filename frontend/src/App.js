import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './components/homepage/Home';
import Exam from './components/exam/Exam';
import Whoareus from './components/whoareus/Whoareus'; // Doğru dosya adı
import ResponsePage from './components/ResponsePage/ResponsePage';
import LoginPage from './components/loginpage/LoginPage';
import RegisterPage from './components/RegisterPage/RegisterPage';
import MyPdfsPage from './components/pdfpage/MyPdfsPage'; // doğru path'e göre ayarla

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/registerpage" element={<RegisterPage/>}/>
        <Route path="/loginpage" element={<LoginPage />} />
        <Route path="/" element={<Home />} />
        <Route path="/exam" element={<Exam />} />
        <Route path="/whoareus" element={<Whoareus />} />
        <Route path="/response" element={<ResponsePage />} />
        <Route path="/mypdfs" element={<MyPdfsPage />} />
        

        {/* Diğer route'larınızı buraya ekleyebilirsiniz */}
      </Routes>
    </Router>
  );
}

export default App;
