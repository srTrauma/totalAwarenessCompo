import React from 'react';
import NavBar from '@/components/NavBar';
import Head from 'next/head';
import FooterMain from '@/components/FooterMain';

const AboutPage = () => {
  return (
    <>
      <Head>
        <title>Sobre Nosotros - TotalAwareness</title>
        <meta name="description" content="Conozca más sobre TotalAwareness, nuestra misión, valores y compromiso con la excelencia." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavBar />
      <div className="max-w-4xl mx-auto px-4 py-16 font-sans text-blue-900 bg-white">
        <header className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight text-blue-900">Sobre Nosotros</h1>
          <p className="text-lg md:text-xl text-blue-800 max-w-2xl mx-auto">Dedicados a la excelencia y la innovación en todo lo que hacemos</p>
        </header>

        <section className="mb-16">
          <h2 className="text-2xl font-bold text-blue-900 mb-4 border-b-2 border-blue-100 inline-block pb-1">Nuestra Misión</h2>
          <p className="text-base md:text-lg text-blue-800 leading-relaxed mt-2">
            Nuestra misión es proporcionar soluciones innovadoras que permitan a las empresas alcanzar su máximo potencial a través de tecnología de vanguardia y un servicio excepcional.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold text-blue-900 mb-4 border-b-2 border-blue-100 inline-block pb-1">Nuestros Valores</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            { [
                { title: "Integridad", desc: "Actuamos con honestidad y ética en cada acción." },
                { title: "Innovación", desc: "Buscamos siempre nuevas formas de mejorar y crear valor." },
                { title: "Excelencia", desc: "Nos esforzamos por superar las expectativas en todo momento." },
                { title: "Trabajo en Equipo", desc: "Creemos en la colaboración y el apoyo mutuo." },
                { title: "Enfoque al Cliente", desc: "Ponemos a nuestros clientes en el centro de cada decisión." },
                { title: "Crecimiento Continuo", desc: "Aprendemos y evolucionamos constantemente." },
              ].map((value, idx) => (
              <div key={idx} className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">{value.title}</h3>
                <p className="text-blue-800 text-sm">{value.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
      <FooterMain />
    </>
  );
};

export default AboutPage;
