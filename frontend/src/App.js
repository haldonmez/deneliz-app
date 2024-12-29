import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './components/homepage/Home';
import Exam from './components/exam/Exam';
import Whoareus from './components/whoareus/Whoareus'; // Doğru dosya adı
import ResponsePage from './components/ResponsePage/ResponsePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/exam" element={<Exam />} />
        <Route path="/whoareus" element={<Whoareus />} />
        <Route path="/response" element={<ResponsePage />} />
        

        {/* Diğer route'larınızı buraya ekleyebilirsiniz */}
      </Routes>
    </Router>
  );
}

export default App;
