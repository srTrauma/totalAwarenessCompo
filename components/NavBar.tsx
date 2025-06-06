import { useState, useEffect } from "react";
import Link from "next/link";
import Button from "./Button";
import Notifications from "./Notification";
import { FaUser, FaCog, FaSignOutAlt, FaChevronDown } from "react-icons/fa";

function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ id: number; name: string; email: string; profileImage?: string } | null>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  // --- INICIO: Script de Microsoft Clarity ---
  useEffect(() => {
    if (typeof window !== "undefined" && !document.getElementById("clarity-script")) {
      const script = document.createElement("script");
      script.id = "clarity-script";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = `
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "rlx1vvqkhk");
      `;
      document.head.appendChild(script);
    }
  }, []);
  // --- FIN: Script de Microsoft Clarity ---

  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== "undefined") {
      // Verificar si hay un usuario logueado en sessionStorage
      const storedUser = sessionStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsLoggedIn(true);
        } catch (error) {
          console.error('Error parsing stored user:', error);
          sessionStorage.removeItem("user");
        }
      }
      
      const handleScroll = () => {
        setScrolled(window.scrollY > 20);
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleAuth = () => {
    if (typeof window !== "undefined") {
      if (isLoggedIn) {
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("selectedCompany");
        setIsLoggedIn(false);
        setUser(null);
        setShowProfileDropdown(false);
        window.location.href = '/';
      } else {
        window.location.href = '/Login';
      }
    }
  };

  const handleProfile = () => {
    setShowProfileDropdown(false);
    if (typeof window !== "undefined") {
      window.location.href = '/Profile';
    }
  };

  // Renderización estática para SSR
  if (!mounted) {
    return (
      <>
        <div className="h-[74px] md:h-[80px]"></div>
        <section className="w-full fixed top-0 z-50 bg-white shadow-sm">
          <nav className="container mx-auto px-4 py-6 md:py-4">
            <div className="flex justify-between items-center">
              <div className="text-xl md:text-2xl font-medium text-[#18214D]">
                Total<span className="font-bold">Awareness</span>
              </div>
              <div className="hidden md:flex items-center gap-6">
                <div className="flex gap-6">
                  <span className="text-sm font-medium text-neutral-700">Inicio</span>
                  <span className="text-sm font-medium text-neutral-700">Sobre Nosotros</span>
                  <span className="text-sm font-medium text-neutral-700">FAQ</span>
                  <span className="text-sm font-medium text-neutral-700">Contacto</span>
                </div>
                <div className="ml-2">
                  <Button Text="Iniciar Sesión" href="/Login" blue />
                </div>
              </div>
              <button className="md:hidden flex items-center text-neutral-800">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </nav>
        </section>
      </>
    );
  }

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
                <Link href="/faq" className="text-sm font-medium text-neutral-700 hover:text-blue-800 transition-colors">
                  FAQ
                </Link>
                <Link href="/contact" className="text-sm font-medium text-neutral-700 hover:text-blue-800 transition-colors">
                  Contacto
                </Link>
                {isLoggedIn && (
                  <>
                    <Link href="/CompanySelection" className="text-sm font-medium text-blue-700 hover:text-blue-900 transition-colors">
                      Gestión de Empresas
                    </Link>
                    <Link href="/projects" className="text-sm font-medium text-blue-700 hover:text-blue-900 transition-colors">
                      Gestion de Salas de Trabajo
                    </Link>
                    <Link href="/tasks" className="text-sm font-medium text-blue-700 hover:text-blue-900 transition-colors">
                      Tareas
                    </Link>
                    <Link href="/posts" className="text-sm font-medium text-blue-700 hover:text-blue-900 transition-colors">
                      Posts
                    </Link>
                  </>
                )}
              </div>
              
              {isLoggedIn && user ? (
                <div className="flex items-center space-x-4">
                  {/* Notificaciones */}
                  <Notifications userId={user.id} />
                  
                  {/* Dropdown de perfil */}
                  <div className="relative">
                    <button
                      onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                      className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-blue-100">
                        {user.profileImage ? (
                          <img 
                            src={user.profileImage} 
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FaUser className="text-blue-600 text-sm" />
                        )}
                      </div>
                      <span className="text-sm font-medium">{user.name}</span>
                      <FaChevronDown className="text-xs" />
                    </button>
                    
                    {showProfileDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                        <div className="py-1">
                          <button
                            onClick={handleProfile}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <FaCog className="mr-3" />
                            Perfil
                          </button>
                          <button
                            onClick={handleAuth}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <FaSignOutAlt className="mr-3" />
                            Cerrar Sesión
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="cursor-pointer ml-2">
                  <Button 
                    Text="Iniciar Sesión" 
                    href="/Login" 
                    blue 
                  />
                </div>
              )}
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
                {isLoggedIn && (
                  <>
                    <Link href="/CompanySelection" 
                      className="block py-3 text-blue-700 font-medium hover:text-blue-900 transition-colors border-b border-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Gestión de Empresas
                    </Link>
                    <Link href="/projects" 
                      className="block py-3 text-blue-700 font-medium hover:text-blue-900 transition-colors border-b border-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Gestion de Salas de Trabajo
                    </Link>
                    <Link href="/tasks" 
                      className="block py-3 text-blue-700 font-medium hover:text-blue-900 transition-colors border-b border-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Tareas
                    </Link>
                    <Link href="/posts" 
                      className="block py-3 text-blue-700 font-medium hover:text-blue-900 transition-colors border-b border-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Posts
                    </Link>
                    <Link href="/Profile" 
                      className="block py-3 text-gray-700 font-medium hover:text-gray-900 transition-colors border-b border-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Mi Perfil
                    </Link>
                  </>
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