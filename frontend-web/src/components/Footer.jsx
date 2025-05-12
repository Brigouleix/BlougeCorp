// src/components/Footer.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';
import Legal from '../pages/Legal';
import Contact from '../pages/Contact';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                <p className="footer-logo">© {new Date().getFullYear()} Blouge Corp</p>
                <nav className="footer-links">
                    <Link to="/legal" className="footer-link">Mentions légales</Link>
                    <Link to="/contact" className="footer-link">Contact</Link>
                </nav>
            </div>
        </footer>
    );
}

