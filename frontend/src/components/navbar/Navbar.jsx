import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const DnaIcon = ({ isScrolled }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
        stroke={isScrolled ? "#FFFFFF" : "#393E46"}
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

const Navbar = () => {
    const [scrolling, setScrolling] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [username, setUsername] = useState(null);
    const [hovered, setHovered] = useState(false);
    const navigate = useNavigate();

    const handleScroll = () => {
        setScrolling(window.scrollY > 50);
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem("username");
        setUsername(null);
        navigate('/loginpage');
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);

        const storedUsername = localStorage.getItem("username");
        if (storedUsername) {
            setUsername(storedUsername);
        }

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <nav className={`navbar ${scrolling ? 'scrolled' : ''}`}>
            <div className="navbar-left">
                <div className="menu-icon" onClick={toggleMenu}>
                    <div className={`bar ${menuOpen ? 'open' : ''}`}></div>
                    <div className={`bar ${menuOpen ? 'open' : ''}`}></div>
                    <div className={`bar ${menuOpen ? 'open' : ''}`}></div>
                </div>
                <div className="navbar-logo">
                    <h1>
                        <Link className="navbar-title" to="/">
                            <span>Dene</span>
                            <span className={`highlight ${scrolling ? 'scrolled' : ''}`}>
                                <DnaIcon isScrolled={scrolling} />liz
                            </span>
                        </Link>
                    </h1>
                </div>
            </div>
            <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
                <li><Link className="nav-link" to="/">Ana Sayfa</Link></li>
                <li><Link className="nav-link" to="/exam">Sınavını Paylaş</Link></li>
                <li><Link className="nav-link" to="/whoareus">Biz Kimiz?</Link></li>
                
              
                <li
                    className="nav-link login-link user-hover"
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                >
                  {username ? (
                <>
                  <span>👤 {username}</span>
                  {hovered && (
                  <div className="user-dropdown">
                        <p>Kullanıcı: {username}</p>
                        <button onClick={() => navigate('/mypdfs')}>PDF'lerim</button>
                        <button onClick={handleLogout}>Çıkış Yap</button>
                  </div>
                  )}
            </>
                    ) : (
                       <Link className="nav-link" to="/loginpage">Giriş Yap</Link>
                    )}
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
