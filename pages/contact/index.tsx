import FooterMain from '@/components/FooterMain';
import NavBar from '@/components/NavBar';
import { FaEnvelope, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa';
import { useState } from 'react';
import Head from 'next/head';

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('¡Mensaje enviado correctamente!');
        setForm({ name: '', email: '', message: '' });
      } else {
        setError(data.message || 'Error al enviar el mensaje');
      }
    } catch {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Contacto - Total Awareness</title>
        <meta name="description" content="Página de contacto de Total Awareness" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavBar />
      <main className="bg-white min-h-screen flex flex-col items-center py-20 px-4">
        <section className="w-full max-w-3xl mb-16">
          <h1 className="text-4xl font-light text-blue-900 mb-4 text-center">Contacto</h1>
          <p className="text-center text-blue-900/80 mb-12 font-light text-xl">
            ¿Tienes alguna pregunta, sugerencia o quieres colaborar con nosotros? Completa el formulario o utiliza los datos de contacto.
          </p>
          <div className="flex flex-col gap-8">
            <div className="bg-blue-50 rounded-xl p-8 flex flex-col gap-4 justify-center items-center border border-blue-100 min-w-[220px]">
              <div className="flex items-center gap-3 text-blue-900">
                <FaEnvelope className="text-2xl" />
                <span className="font-light text-lg">contacto@totalawareness.com</span>
              </div>
              <div className="flex items-center gap-3 text-blue-900">
                <FaPhoneAlt className="text-2xl" />
                <span className="font-light text-lg">+34 600 123 456</span>
              </div>
              <div className="flex items-center gap-3 text-blue-900">
                <FaMapMarkerAlt className="text-2xl" />
                <span className="font-light text-lg">Calle Innovación 42, Madrid, España</span>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="bg-white border border-blue-100 rounded-xl p-8 flex flex-col gap-6 shadow-none">
              <div>
                <label className="block text-base font-light text-blue-900 mb-1">Nombre</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-blue-100 rounded-md focus:ring-1 focus:ring-blue-900 focus:border-blue-900 bg-white text-blue-900 font-light outline-none transition text-lg"
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <label className="block text-base font-light text-blue-900 mb-1">Correo electrónico</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-blue-100 rounded-md focus:ring-1 focus:ring-blue-900 focus:border-blue-900 bg-white text-blue-900 font-light outline-none transition text-lg"
                  placeholder="tu@email.com"
                />
              </div>
              <div>
                <label className="block text-base font-light text-blue-900 mb-1">Mensaje</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-blue-100 rounded-md focus:ring-1 focus:ring-blue-900 focus:border-blue-900 bg-white text-blue-900 font-light outline-none transition text-lg"
                  placeholder="Escribe tu mensaje aquí"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-900 hover:bg-blue-800 text-white font-light py-4 rounded-md transition disabled:opacity-60 text-lg"
              >
                {loading ? 'Enviando...' : 'Enviar mensaje'}
              </button>
              {success && <p className="mt-2 text-green-600 text-center text-base font-light">{success}</p>}
              {error && <p className="mt-2 text-red-600 text-center text-base font-light">{error}</p>}
            </form>
          </div>
        </section>
        <section className="w-full max-w-2xl text-center mt-12">
          <h2 className="text-xl text-blue-900 font-light mb-2">Síguenos en redes sociales</h2>
          <div className="flex justify-center gap-6 mt-2">
            <a href="#" className="text-blue-900 hover:text-blue-700 transition" aria-label="Twitter"><svg width="24" height="24" fill="currentColor"><path d="M22.46 5.92c-.8.36-1.67.6-2.58.71a4.48 4.48 0 0 0 1.97-2.48 8.93 8.93 0 0 1-2.83 1.08A4.48 4.48 0 0 0 11.1 9.03c0 .35.04.7.11 1.03A12.7 12.7 0 0 1 3.15 5.1a4.48 4.48 0 0 0 1.39 5.98c-.74-.02-1.44-.23-2.05-.57v.06a4.48 4.48 0 0 0 3.6 4.4c-.35.1-.72.16-1.1.16-.27 0-.52-.03-.77-.07a4.48 4.48 0 0 0 4.18 3.11A9 9 0 0 1 2 20.29a12.7 12.7 0 0 0 6.88 2.02c8.26 0 12.78-6.84 12.78-12.78 0-.2 0-.39-.01-.58.88-.64 1.65-1.44 2.26-2.35z"/></svg></a>
            <a href="#" className="text-blue-900 hover:text-blue-700 transition" aria-label="LinkedIn"><svg width="24" height="24" fill="currentColor"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm13.5 10.28h-3v-4.5c0-1.08-.02-2.47-1.5-2.47-1.5 0-1.73 1.17-1.73 2.39v4.58h-3v-9h2.88v1.23h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v4.72z"/></svg></a>
            <a href="#" className="text-blue-900 hover:text-blue-700 transition" aria-label="Instagram"><svg width="24" height="24" fill="currentColor"><path d="M12 2.2c3.2 0 3.584.012 4.85.07 1.17.056 1.97.24 2.43.41.59.22 1.01.48 1.45.92.44.44.7.86.92 1.45.17.46.354 1.26.41 2.43.058 1.266.07 1.65.07 4.85s-.012 3.584-.07 4.85c-.056 1.17-.24 1.97-.41 2.43-.22.59-.48 1.01-.92 1.45-.44.44-.86.7-1.45.92-.46.17-1.26.354-2.43.41C8.416 2.212 8.8 2.2 12 2.2zm0-2.2C8.736 0 8.332.012 7.052.07c-1.28.058-2.16.24-2.91.51-.8.29-1.48.68-2.15 1.35-.67.67-1.06 1.35-1.35 2.15-.27.75-.452 1.63-.51 2.91C.012 8.332 0 8.736 0 12c0 3.264.012 3.668.07 4.948.058 1.28.24 2.16.51 2.91.29.8.68 1.48 1.35 2.15.67.67 1.35 1.06 2.15 1.35.75.27 1.63.452 2.91.51C8.332 23.988 8.736 24 12 24c3.264 0 3.668-.012 4.948-.07 1.28-.058 2.16-.24 2.91-.51.8-.29 1.48-.68 2.15-1.35.67-.67 1.06-1.35 1.35-2.15.27-.75.452-1.63.51-2.91.058-1.28.07-1.684.07-4.948 0-3.264-.012-3.668-.07-4.948-.058-1.28-.24-2.16-.51-2.91-.29-.8-.68-1.48-1.35-2.15-.67-.67-1.35-1.06-2.15-1.35-.75-.27-1.63-.452-2.91-.51C15.668.012 15.264 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm7.844-10.406a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/></svg></a>
          </div>
        </section>
      </main>
      <FooterMain />
    </>
  );
};

export default ContactPage;
