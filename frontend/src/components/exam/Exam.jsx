import React from 'react';
import Navbar from '../navbar/Navbar';
import Gemini from '../gemini/Gemini';

import './Exam.css';


const Exam = () => {
    return (
        <div className="exam-container"> {/* Tek kapsayıcıda tutun */}
            <Navbar />
            <div className="gemini-container">
            <Gemini />
            </div>
        </div>
    );
}

export default Exam;

    
