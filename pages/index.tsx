import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import NavBar from '@/components/NavBar';
import FooterMain from '@/components/FooterMain';
import { FaBuilding, FaTasks, FaUsers, FaChartBar, FaRocket, FaLock } from 'react-icons/fa';

export default function HomePage() {
  return (
    <React.Fragment>
      <Head>
        <title>Total Awareness - Plataforma de Gestión Empresarial</title>
        <meta name="description" content="La plataforma integral para la gestión empresarial, colaboración en equipo y seguimiento de proyectos" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen flex flex-col bg-white text-black">
        <NavBar />
        <main className="flex-grow">
          {/* Hero Section */}
          <section className="w-full border-b border-gray-200 py-20">
            <div className="max-w-3xl mx-auto px-4 text-center">
              <h1 className="text-5xl font-extrabold mb-6 tracking-tight">Total Awareness</h1>
              <p className="text-lg text-gray-700 mb-10">La plataforma minimalista para la gestión empresarial, colaboración y seguimiento de proyectos.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/Login" className="px-8 py-3 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition">Iniciar Sesión</Link>
                <Link href="/about" className="px-8 py-3 border border-black text-black rounded-full font-semibold hover:bg-gray-100 transition">Conocer Más</Link>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16">
            <div className="max-w-5xl mx-auto px-4">
              <h2 className="text-2xl font-bold mb-12 text-center">Características</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center p-8 border border-gray-200 rounded-lg bg-white">
                  <FaBuilding className="w-8 h-8 mb-4 text-black" />
                  <h3 className="font-semibold mb-2">Espacios de Trabajo</h3>
                  <p className="text-gray-600 text-center mb-4">Organiza proyectos y equipos de forma simple y eficiente.</p>
                  <Link href="/workspaces" className="text-black underline hover:text-gray-700">Ver más</Link>
                </div>
                <div className="flex flex-col items-center p-8 border border-gray-200 rounded-lg bg-white">
                  <FaTasks className="w-8 h-8 mb-4 text-black" />
                  <h3 className="font-semibold mb-2">Gestión de Tareas</h3>
                  <p className="text-gray-600 text-center mb-4">Gestiona y asigna tareas con claridad y rapidez.</p>
                  <Link href="/tasks" className="text-black underline hover:text-gray-700">Ver más</Link>
                </div>
                <div className="flex flex-col items-center p-8 border border-gray-200 rounded-lg bg-white">
                  <FaUsers className="w-8 h-8 mb-4 text-black" />
                  <h3 className="font-semibold mb-2">Gestión de Empresas</h3>
                  <p className="text-gray-600 text-center mb-4">Administra empresas, roles y permisos desde un solo lugar.</p>
                  <Link href="/companies/explore" className="text-black underline hover:text-gray-700">Ver más</Link>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 border-t border-b border-gray-200 bg-white">
            <div className="max-w-2xl mx-auto px-4 text-center">
              <h2 className="text-2xl font-bold mb-4">¿Listo para comenzar?</h2>
              <p className="text-gray-700 mb-8">Únete a empresas que ya gestionan su futuro con Total Awareness.</p>
              <Link href="/Login" className="px-8 py-3 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition">Crear cuenta gratis</Link>
            </div>
          </section>
        </main>
        <FooterMain />
      </div>
    </React.Fragment>
  );
}
