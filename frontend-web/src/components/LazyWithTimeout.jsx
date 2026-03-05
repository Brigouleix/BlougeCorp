// src/utils/LazyWithTimeout.js
import React, { Suspense, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LazyWithTimeout({ children, timeout = 8000 }) {
  const [tooLong, setTooLong] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setTooLong(true);
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout]);

  useEffect(() => {
    if (tooLong) {
      navigate('/not-found');
    }
  }, [tooLong, navigate]);

  return (
    <Suspense fallback={<div className="text-center p-8">Chargement...</div>}>
      {children}
    </Suspense>
  );
}
