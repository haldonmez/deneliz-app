// components/navbar/NavbarLogo.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './navbar/Navbar.css';

const DnaIcon = ({ isScrolled }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#00aebc"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ marginRight: '0px', alignSelf: 'center' }}
    >
        <path d="M12 2v20" />
        <path d="M8 2c-2 2-2 5 0 7s2 5 0 7" />
        <path d="M16 2c2 2 2 5 0 7s-2 5 0 7" />
        <path d="M8 12c0 2 2 4 4 4s4-2 4-4" />
    </svg>
);

const NavbarLogo = () => (
    <h1 className="navbar-logo login-logo">
        <Link className="navbar-title">
            <span>Dene</span>
            <span className="highlight"><DnaIcon />liz</span>
        </Link>
    </h1>
);

export default NavbarLogo;
