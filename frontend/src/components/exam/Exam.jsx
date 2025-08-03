import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../navbar/Navbar';
import Gemini from '../gemini/Gemini';

import './Exam.css';

const Exam = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const username = localStorage.getItem('username');
        if (!username) {
            navigate('/loginpage'); // Giriş yapılmamışsa login sayfasına yönlendir
        }
    }, [navigate]);

    return (
        <div className="exam-container">
            <Navbar />
            <div className="gemini-container">
                <Gemini />
            </div>
        </div>
    );
};

export default Exam;

    
