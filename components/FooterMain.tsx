import Link from 'next/link';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaGithub, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

export default function FooterMain() {
    return (
        <footer className="bg-white border-t border-blue-100 text-blue-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div>
                        <h2 className="text-xl font-light mb-4 tracking-tight">Total Awareness</h2>
                        <p className="text-blue-800 mb-6 text-sm font-light leading-relaxed">
                            Plataforma minimalista para la gestión empresarial, colaboración y análisis.
                        </p>
                        <div className="space-y-2 text-blue-700 text-sm">
                            <div className="flex items-center">
                                <FaEnvelope className="w-4 h-4 mr-2 text-blue-700" /> contacto@totalawareness.com
                            </div>
                            <div className="flex items-center">
                                <FaPhone className="w-4 h-4 mr-2 text-blue-700" /> +34 600 123 456
                            </div>
                            <div className="flex items-center">
                                <FaMapMarkerAlt className="w-4 h-4 mr-2 text-blue-700" /> Calle Innovación 42, Madrid
                            </div>
                        </div>
                    </div>
                    {/* Links */}
                    <div>                        <h3 className="text-base font-semibold mb-4">Producto</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/projects" className="hover:underline hover:text-blue-600">Proyectos</Link></li>
                            <li><Link href="/tasks" className="hover:underline hover:text-blue-600">Gestión de Tareas</Link></li>
                            <li><Link href="/companies/explore" className="hover:underline hover:text-blue-600">Empresas</Link></li>
                            <li><Link href="/Dashboard" className="hover:underline hover:text-blue-600">Analytics</Link></li>
                            <li><Link href="/posts" className="hover:underline hover:text-blue-600">Comunicación</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-base font-semibold mb-4">Empresa</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/about" className="hover:underline hover:text-blue-600">Acerca de Nosotros</Link></li>
                            <li><Link href="/contact" className="hover:underline hover:text-blue-600">Contacto</Link></li>
                            <li><Link href="/faq" className="hover:underline hover:text-blue-600">Preguntas Frecuentes</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 border-t border-blue-100 pt-6 text-xs text-blue-600 text-center">
                    © {new Date().getFullYear()} Total Awareness. Todos los derechos reservados.
                </div>
            </div>
        </footer>
    );
}