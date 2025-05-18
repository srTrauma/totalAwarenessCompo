import React, { useEffect, useState } from 'react';
import NavBar from '@/components/NavBar';
import FooterMain from '@/components/FooterMain';
import '@/app/globals.css';

interface FAQ {
  id: number;
  question: string;
  answer: string | null;
}

const FAQPage = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [responseText, setResponseText] = useState<{ [key: number]: string }>({});
  const [newQuestion, setNewQuestion] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const response = await fetch('/api/faqs');
        if (!response.ok) {
          throw new Error('Error al obtener las FAQs');
        }
        const data = await response.json();
        setFaqs(data);
      } catch (error) {
        console.error('Error fetching FAQs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  const handleAddFAQ = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/faqs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: newQuestion }),
      });

      if (!response.ok) {
        throw new Error('Error al añadir la FAQ');
      }

      const newFAQ = await response.json();
      setFaqs((prevFaqs) => [...prevFaqs, newFAQ]);
      setNewQuestion('');
    } catch (error) {
      console.error('Error adding FAQ:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResponseSubmit = async (e: React.FormEvent, id: number) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/faqs', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, answer: responseText[id] }),
      });

      if (!response.ok) {
        throw new Error('Error al responder la FAQ');
      }

      const updatedFAQ = await response.json();
      setFaqs((prevFaqs) =>
        prevFaqs.map((faq) => (faq.id === updatedFAQ.id ? updatedFAQ : faq))
      );
      setResponseText((prev) => ({ ...prev, [id]: '' }));
      setExpandedFAQ(null);
    } catch (error) {
      console.error('Error responding to FAQ:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Input styles classes
  const inputClasses = "mt-1 block w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg shadow-sm text-gray-800 transition-all duration-300 ease-in-out focus:border-blue-500 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 focus:outline-none focus:scale-[1.01] transform";
  
  return (
    <>
    <div className="bg-gray-50 text-neutral-800 min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-grow max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-blue-900 mb-8 text-center">Preguntas Frecuentes</h1>

        {/* Formulario para añadir nuevas FAQs */}
        <form onSubmit={handleAddFAQ} className="mb-8 space-y-4">
          <h2 className="text-2xl font-bold text-blue-900">Añadir una nueva pregunta</h2>
          <div>
            <label htmlFor="new-question" className="block text-sm font-medium text-gray-700 mb-1">
              Pregunta
            </label>
            <input
              id="new-question"
              type="text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className={inputClasses}
              required
              placeholder="Escribe tu pregunta aquí"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            disabled={submitting}
          >
            {submitting ? 'Añadiendo...' : 'Añadir Pregunta'}
          </button>
        </form>
        
        {/* Lista de FAQs */}
        {loading ? (
          <p className="text-center text-gray-500">Cargando FAQs...</p>
        ) : (
          <div className="space-y-6">
            {faqs.length > 0 ? (
              faqs.map((faq) => (
                <div key={faq.id} className="border-b border-gray-200 pb-4">
                  <h2 className="text-xl font-semibold text-blue-800">{faq.question}</h2>
                  <p className="text-gray-700 mt-2">
                    {faq.answer ? faq.answer : 'Esta pregunta aún no tiene respuesta.'}
                  </p>
                  {!faq.answer && (
                    <>
                      <button
                        onClick={() =>
                          setExpandedFAQ((prev) => (prev === faq.id ? null : faq.id))
                        }
                        className="text-blue-600 hover:underline mt-2 transition-all duration-200 hover:text-blue-800"
                      >
                        {expandedFAQ === faq.id ? 'Ocultar' : 'Responder'}
                      </button>
                      {expandedFAQ === faq.id && (
                        <form
                          onSubmit={(e) => handleResponseSubmit(e, faq.id)}
                          className="mt-4 space-y-2"
                        >
                          <label
                            htmlFor={`response-${faq.id}`}
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Respuesta
                          </label>
                          <textarea
                            id={`response-${faq.id}`}
                            value={responseText[faq.id] || ''}
                            onChange={(e) =>
                              setResponseText((prev) => ({ ...prev, [faq.id]: e.target.value }))
                            }
                            className={inputClasses}
                            rows={3}
                            required
                            placeholder="Escribe tu respuesta aquí"
                          />
                          <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                            disabled={submitting}
                          >
                            {submitting ? 'Enviando...' : 'Responder'}
                          </button>
                        </form>
                      )}
                    </>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No hay FAQs disponibles.</p>
            )}
          </div>
        )}
      </main>
      <FooterMain />
    </div>
    </>
  );
};

export default FAQPage;