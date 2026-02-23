'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from "@/components/link";
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-larafest-blue/95 backdrop-blur-md shadow-xl' 
          : 'bg-transparent'
      }`}
    >
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="text-2xl font-bold text-white">
          <Link href="/" aria-label="Inicio">
            <Image src="/img/logo-header.jpg" alt="Tecnovial" height={48} width={150} className="h-8 w-auto md:h-12"/>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-8">
          <Link href="/eventos" className="text-white hover:text-larafest-cyan transition-colors">Eventos</Link>
          <Link href="/evento" className="text-white hover:text-larafest-cyan transition-colors">Evento</Link>
          <Link href="/servicios" className="text-white hover:text-larafest-cyan transition-colors">Servicios</Link>
          <Link href="/expositores" className="text-white hover:text-larafest-cyan transition-colors">Expositores</Link>
          <Link href="/patrocinio" className="text-white hover:text-larafest-cyan transition-colors">Patrocinios</Link>
          <Link href="/contacto" className="text-white hover:text-larafest-cyan transition-colors">Contacto</Link>
        </div>

        {/* Desktop Buttons */}
        <div className='hidden md:flex gap-4'>
          <Link href="/tickets">
            <Button className="bg-larafest-red hover:bg-larafest-red/80 text-white px-6 py-2 rounded-full transform hover:scale-105 transition-all">
              Obtener Boletos
            </Button>
          </Link>
          <Link href="/login">
            <Button className="bg-larafest-cyan hover:bg-larafest-cyan/80 text-white px-6 py-2 rounded-full transform hover:scale-105 transition-all">
              Iniciar Sesión
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={toggleMobileMenu}
            className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-larafest-blue/95 backdrop-blur-md border-t border-white/10">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {/* Mobile Navigation Links */}
            <div className="flex flex-col space-y-3">
              <Link
                href="/eventos"
                className="text-white hover:text-larafest-cyan transition-colors py-2 border-b border-white/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                Eventos
              </Link>
              <Link
                href="/evento"
                className="text-white hover:text-larafest-cyan transition-colors py-2 border-b border-white/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                Evento
              </Link>
              <Link
                href="/servicios"
                className="text-white hover:text-larafest-cyan transition-colors py-2 border-b border-white/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                Servicios
              </Link>
              <Link
                href="/expositores"
                className="text-white hover:text-larafest-cyan transition-colors py-2 border-b border-white/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                Expositores
              </Link>
              <Link
                href="/patrocinio"
                className="text-white hover:text-larafest-cyan transition-colors py-2 border-b border-white/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                Patrocinios
              </Link>
              <Link
                href="/contacto"
                className="text-white hover:text-larafest-cyan transition-colors py-2 border-b border-white/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contacto
              </Link>
            </div>
            
            {/* Mobile Buttons */}
            <div className="flex flex-col space-y-3 pt-4">
              <Link href="/tickets" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-larafest-red hover:bg-larafest-red/80 text-white py-3 rounded-full transform hover:scale-105 transition-all">
                  Obtener Boletos
                </Button>
              </Link>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-larafest-cyan hover:bg-larafest-cyan/80 text-white py-3 rounded-full transform hover:scale-105 transition-all">
                  Iniciar Sesión
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;