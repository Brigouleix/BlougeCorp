// src/components/Footer.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                <p className="footer-logo">© {new Date().getFullYear()} Blouge Corp</p>
                <nav className="footer-links">
                    <Link to="/legal" className="footer-link">Mentions légales</Link>
                    <Link to="/privacy" className="footer-link">Confidentialité</Link>
                    <Link to="/contact" className="footer-link">Contact</Link>
                </nav>
            </div>
        </footer>
    );
}
