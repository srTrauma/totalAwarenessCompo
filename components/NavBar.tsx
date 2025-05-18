import { useState, useEffect } from 'react';
import Button from "./Button";
import { useRouter } from "next/navigation";
import Link from "next/link";

function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");
    setIsLoggedIn(!!user);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAuth = () => {
    if (isLoggedIn) {
      localStorage.removeItem("user");
      setIsLoggedIn(false);
      router.push('/');
    } else {
      router.push('/Login');
    }
  };

  return (
    <>
      <div className="h-[74px] md:h-[80px]"></div>
      <section className={`w-full fixed top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-sm shadow-md' : 'bg-white shadow-sm'
      }`}>
        <nav className="container mx-auto px-4 py-6 md:py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-xl md:text-2xl font-medium text-[#18214D]">
              Total<span className="font-bold">Awareness</span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <div className="flex gap-6">
                <Link href="/" className="text-sm font-medium text-neutral-700 hover:text-blue-800 transition-colors">
                  Inicio
                </Link>
                <Link href="/about" className="text-sm font-medium text-neutral-700 hover:text-blue-800 transition-colors">
                  Sobre Nosotros
                </Link>
                <Link href="/services" className="text-sm font-medium text-neutral-700 hover:text-blue-800 transition-colors">
                  Servicios
                </Link>
                <Link href="/faq" className="text-sm font-medium text-neutral-700 hover:text-blue-800 transition-colors">
                  FAQ
                </Link>
                <Link href="/contact" className="text-sm font-medium text-neutral-700 hover:text-blue-800 transition-colors">
                  Contacto
                </Link>
                {isLoggedIn && (
                  <Link href="/CompanySelection" className="text-sm font-medium text-blue-700 hover:text-blue-900 transition-colors">
                    Gestión de Empresas
                  </Link>
                )}
              </div>
              <div onClick={handleAuth} className="cursor-pointer ml-2">
                <Button 
                  Text={isLoggedIn ? "Cerrar Sesión" : "Iniciar Sesión"} 
                  href={isLoggedIn ? "/" : "/Login"} 
                  blue 
                />
              </div>
            </div>

            <button 
              className="md:hidden flex items-center text-neutral-800"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>

          {isMenuOpen && (
            <div className="md:hidden absolute left-0 right-0 top-full bg-white shadow-lg z-50">
              <div className="flex flex-col px-4 py-4">
                <Link href="/" 
                  className="block py-3 text-neutral-800 font-medium hover:text-blue-800 transition-colors border-b border-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Inicio
                </Link>
                <Link href="/about" 
                  className="block py-3 text-neutral-800 font-medium hover:text-blue-800 transition-colors border-b border-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sobre Nosotros
                </Link>
                <Link href="/services" 
                  className="block py-3 text-neutral-800 font-medium hover:text-blue-800 transition-colors border-b border-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Servicios
                </Link>
                <Link href="/faq" 
                  className="block py-3 text-neutral-800 font-medium hover:text-blue-800 transition-colors border-b border-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  FAQ
                </Link>
                <Link href="/contact" 
                  className="block py-3 text-neutral-800 font-medium hover:text-blue-800 transition-colors border-b border-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contacto
                </Link>
                <Link href="/privacy" 
                  className="block py-3 text-neutral-800 font-medium hover:text-blue-800 transition-colors border-b border-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Política de Privacidad
                </Link>
                <Link href="/terms" 
                  className="block py-3 text-neutral-800 font-medium hover:text-blue-800 transition-colors border-b border-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Términos de Servicio
                </Link>
                {isLoggedIn && (
                  <Link href="/Dashboard" 
                    className="block py-3 text-blue-700 font-medium hover:text-blue-900 transition-colors border-b border-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Gestión de Empresas
                  </Link>
                )}
                <div onClick={() => {
                  handleAuth();
                  setIsMenuOpen(false);
                }} className="pt-3">
                  <Button Text={isLoggedIn ? "Cerrar Sesión" : "Iniciar Sesión"} href={isLoggedIn ? "/" : "/Login"} blue />
                </div>
              </div>
            </div>
          )}
        </nav>
      </section>
    </>
  );
}

export default NavBar;