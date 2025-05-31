import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import NavBar from "@/components/NavBar";
import PostManager from "@/components/PostManager";
import { FaArrowLeft } from "react-icons/fa";
import "@/app/globals.css";

export default function PostsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/Login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <>
        <Head>
          <title>Cargando... | Total Awareness</title>
        </Head>
        <NavBar />
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Posts de Empresa | Total Awareness</title>
        <meta name="description" content="Crea y gestiona publicaciones para tu empresa" />
      </Head>
      
      <NavBar />
      
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center text-blue-600 mb-4 hover:underline"
            >
              <FaArrowLeft className="mr-2" /> Volver
            </button>
            
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Posts de Empresa</h1>
              <p className="text-gray-600">
                Comparte noticias, ofertas de trabajo, eventos y actualizaciones importantes.
                Mantén a tu audiencia informada y comprometida con contenido relevante.
              </p>
            </div>
          </div>

          <PostManager userId={user.id} />
        </div>
      </div>
    </>
  );
}
