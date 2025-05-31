import FooterMain from '@/components/FooterMain';
import NavBar from '@/components/NavBar';
import '@/app/globals.css';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

interface User {
  id: number;
  name: string;
  email: string;
}

interface Faq {
  id: number;
  question: string;
  answer: string | null;
  createdByUserId: number | null;
  createdByUserName: string | null;
  respondedByUserId: number | null;
  respondedByUserName: string | null;
  respondedAt: string | null;
  createdAt: string;
}

const FAQPage = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);  const [responseText, setResponseText] = useState<{ [key: number]: string }>({});
  const [newQuestion, setNewQuestion] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [deletingItem, setDeletingItem] = useState<{ id: number; type: 'question' | 'answer' } | null>(null);

  useEffect(() => {
    // Verificar si el usuario está autenticado
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/Login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    
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
  }, [router]);
  const handleAddFAQ = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSubmitting(true);

    try {
      const response = await fetch('/api/faqs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          question: newQuestion,
          userId: user.id,
          userName: user.name
        }),
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
  };  const handleResponseSubmit = async (e: React.FormEvent, id: number) => {
    e.preventDefault();
    if (!user) return;
    
    setSubmitting(true);

    try {
      const response = await fetch('/api/faqs', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          id, 
          answer: responseText[id],
          userId: user.id,
          userName: user.name
        }),
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

  const handleDeleteQuestion = async (id: number) => {
    if (!user) return;
    
    setDeletingItem({ id, type: 'question' });

    try {
      const response = await fetch('/api/faqs', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          id,
          userId: user.id
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.message || 'Error al eliminar la pregunta');
        return;
      }

      // Eliminar la FAQ de la lista
      setFaqs((prevFaqs) => prevFaqs.filter((faq) => faq.id !== id));
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      alert('Error al eliminar la pregunta');
    } finally {
      setDeletingItem(null);
    }
  };

  const handleDeleteAnswer = async (id: number) => {
    if (!user) return;
    
    setDeletingItem({ id, type: 'answer' });

    try {
      const response = await fetch('/api/faqs', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          id,
          userId: user.id,
          action: 'delete-answer'
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.message || 'Error al eliminar la respuesta');
        return;
      }

      const result = await response.json();
      // Actualizar la FAQ en la lista
      setFaqs((prevFaqs) =>
        prevFaqs.map((faq) => (faq.id === id ? result.faq : faq))
      );
    } catch (error) {
      console.error('Error deleting answer:', error);
      alert('Error al eliminar la respuesta');
    } finally {
      setDeletingItem(null);
    }
  };

  // Función para verificar si el usuario puede eliminar una pregunta
  const canDeleteQuestion = (faq: Faq) => {
    return user && faq.createdByUserId === user.id;
  };

  // Función para verificar si el usuario puede eliminar una respuesta
  const canDeleteAnswer = (faq: Faq) => {
    return user && faq.respondedByUserId === user.id;
  };

  // Función para verificar si el usuario puede responder (no anónimo y no ha respondido ya)
  const canRespond = (faq: Faq) => {
    return user && user.id && !faq.answer;
  };
  // No renderizar nada hasta verificar autenticación
  if (!user) {
    return (
      <div className="bg-gray-50 text-neutral-800 min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-lg text-gray-600">Verificando autenticación...</p>
        </main>
      </div>
    );
  }

  // Input styles classes
  const inputClasses = "mt-1 block w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg shadow-sm text-gray-800 transition-all duration-300 ease-in-out focus:border-blue-500 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 focus:outline-none focus:scale-[1.01] transform";
  
  return (
    <>
    <Head>
      <title>Preguntas Frecuentes - Total Awareness</title>
      <meta name="description" content="Preguntas frecuentes sobre Total Awareness." />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <div className="bg-gray-50 text-neutral-800 min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-grow max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-blue-900 mb-8 text-center">Preguntas Frecuentes</h1>        {/* Formulario para añadir nuevas FAQs */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-8">
          <form onSubmit={handleAddFAQ} className="space-y-4">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Hacer una nueva pregunta</h2>
            <div>
              <label htmlFor="new-question" className="block text-sm font-medium text-gray-700 mb-2">
                ¿Cuál es tu pregunta?
              </label>
              <textarea
                id="new-question"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className={inputClasses}
                rows={3}
                required
                placeholder="Describe tu pregunta de manera clara y detallada..."
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 font-medium"
              disabled={submitting}
            >
              {submitting ? 'Enviando pregunta...' : 'Publicar pregunta'}
            </button>
          </form>
        </div>
          {/* Lista de FAQs */}
        {loading ? (
          <p className="text-center text-gray-500">Cargando FAQs...</p>
        ) : (
          <div className="space-y-6">            {faqs.length > 0 ? (
              faqs.map((faq) => (
                <div key={faq.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="mb-3">
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="text-xl font-semibold text-blue-800 flex-1">{faq.question}</h2>
                      {canDeleteQuestion(faq) && (
                        <button
                          onClick={() => {
                            if (confirm('¿Estás seguro de que quieres eliminar esta pregunta?')) {
                              handleDeleteQuestion(faq.id);
                            }
                          }}
                          className="ml-3 text-red-500 hover:text-red-700 transition-colors duration-200 text-sm font-medium disabled:opacity-50"
                          disabled={deletingItem?.id === faq.id && deletingItem?.type === 'question'}
                        >
                          {deletingItem?.id === faq.id && deletingItem?.type === 'question' ? 'Eliminando...' : 'Eliminar pregunta'}
                        </button>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-4">
                      <span>
                        <strong>Preguntado por:</strong> {faq.createdByUserName || 'Usuario anónimo'}
                      </span>
                      <span>
                        <strong>Fecha:</strong> {new Date(faq.createdAt).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  </div>
                  
                  {faq.answer ? (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-gray-700 flex-1">{faq.answer}</p>
                        {canDeleteAnswer(faq) && (
                          <button
                            onClick={() => {
                              if (confirm('¿Estás seguro de que quieres eliminar esta respuesta?')) {
                                handleDeleteAnswer(faq.id);
                              }
                            }}
                            className="ml-3 text-red-500 hover:text-red-700 transition-colors duration-200 text-sm font-medium disabled:opacity-50"
                            disabled={deletingItem?.id === faq.id && deletingItem?.type === 'answer'}
                          >
                            {deletingItem?.id === faq.id && deletingItem?.type === 'answer' ? 'Eliminando...' : 'Eliminar respuesta'}
                          </button>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-4">
                        <span>
                          <strong>Respondido por:</strong> {faq.respondedByUserName || 'Usuario anónimo'}
                        </span>
                        {faq.respondedAt && (
                          <span>
                            <strong>Fecha:</strong> {new Date(faq.respondedAt).toLocaleDateString('es-ES')}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <p className="text-gray-600 italic bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        Esta pregunta aún no tiene respuesta.
                      </p>
                      {canRespond(faq) && (
                        <>
                          <button
                            onClick={() =>
                              setExpandedFAQ((prev) => (prev === faq.id ? null : faq.id))
                            }
                            className="text-blue-600 hover:underline mt-3 transition-all duration-200 hover:text-blue-800 font-medium"
                          >
                            {expandedFAQ === faq.id ? 'Ocultar formulario' : 'Responder pregunta'}
                          </button>
                          {expandedFAQ === faq.id && (
                            <form
                              onSubmit={(e) => handleResponseSubmit(e, faq.id)}
                              className="mt-4 space-y-3 p-4 bg-gray-50 rounded-lg border"
                            >
                              <label
                                htmlFor={`response-${faq.id}`}
                                className="block text-sm font-medium text-gray-700"
                              >
                                Tu respuesta
                              </label>
                              <textarea
                                id={`response-${faq.id}`}
                                value={responseText[faq.id] || ''}
                                onChange={(e) =>
                                  setResponseText((prev) => ({ ...prev, [faq.id]: e.target.value }))
                                }
                                className={inputClasses}
                                rows={4}
                                required
                                placeholder="Escribe tu respuesta aquí..."
                              />
                              <div className="flex gap-2">
                                <button
                                  type="submit"
                                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50"
                                  disabled={submitting}
                                >
                                  {submitting ? 'Enviando...' : 'Enviar respuesta'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setExpandedFAQ(null)}
                                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors duration-200"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </form>
                          )}
                        </>
                      )}
                      {!canRespond(faq) && !faq.answer && (
                        <p className="text-gray-500 text-sm mt-3 italic">
                          {!user?.id ? 'Debes estar logueado para responder preguntas.' : 'Esta pregunta ya tiene respuesta.'}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No hay FAQs disponibles.</p>
                <p className="text-gray-400 text-sm mt-2">¡Sé el primero en hacer una pregunta!</p>
              </div>
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