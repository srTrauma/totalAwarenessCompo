import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import NavBar from "@/components/NavBar";
import { FaArrowLeft, FaBuilding, FaSave, FaTrash } from "react-icons/fa";
import "@/app/globals.css";

interface CompanyDetails {
  id: number;
  name: string;
  description: string | null;
  public: boolean;
  owner: {
    id: number;
    name: string;
  };
  isOwner: boolean;
}

export default function EditCompany() {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null);
  const [company, setCompany] = useState<CompanyDetails | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      router.push("/Login");
    }
  }, [router]);

  useEffect(() => {
    if (id && user) {
      fetchCompanyDetails();
    }
  }, [id, user]);

  async function fetchCompanyDetails() {
    if (!id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/companies/detail?companyId=${id}`, {
        headers: {
          userid: user!.id.toString()
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCompany(data);
        setName(data.name);
        setDescription(data.description || "");
        setIsPublic(data.public);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Error al cargar detalles de la empresa");
        setTimeout(() => {
          router.push("/Dashboard");
        }, 3000);
      }
    } catch (error) {
      console.error("Error al cargar detalles de la empresa:", error);
      setError("Error al conectar con el servidor");
      setTimeout(() => {
        router.push("/Dashboard");
      }, 3000);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!name.trim()) {
      setError("El nombre de la empresa es obligatorio");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch("/api/companies/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          userid: user!.id.toString()
        },
        body: JSON.stringify({
          companyId: Number(id),
          name: name.trim(),
          description: description.trim() || null,
          public: isPublic
        }),
      });

      if (response.ok) {
        alert("Empresa actualizada correctamente");
        router.push("/Dashboard");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Error al actualizar la empresa");
      }
    } catch (error) {
      console.error("Error al actualizar la empresa:", error);
      setError("Error al conectar con el servidor");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      setSaving(true);
      const response = await fetch("/api/companies/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          userid: user!.id.toString()
        },
        body: JSON.stringify({
          companyId: Number(id)
        }),
      });

      if (response.ok) {
        alert("Empresa eliminada correctamente");
        localStorage.removeItem("selectedCompany");
        router.push("/CompanySelection");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Error al eliminar la empresa");
      }
    } catch (error) {
      console.error("Error al eliminar la empresa:", error);
      setError("Error al conectar con el servidor");
    } finally {
      setSaving(false);
      setShowDeleteConfirm(false);
    }
  }

  function goBack() {
    router.push("/Dashboard");
  }

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

  if (error) {
    return (
      <>
        <Head>
          <title>Error | Total Awareness</title>
        </Head>
        <NavBar />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <button 
            onClick={goBack} 
            className="flex items-center text-blue-600 mb-6 hover:underline"
          >
            <FaArrowLeft className="mr-2" /> Volver al Dashboard
          </button>
          <div className="p-6 bg-red-50 rounded-lg border border-red-200">
            <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </>
    );
  }

  if (!company) {
    return (
      <>
        <Head>
          <title>Empresa no encontrada | Total Awareness</title>
        </Head>
        <NavBar />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <button 
            onClick={goBack} 
            className="flex items-center text-blue-600 mb-6 hover:underline"
          >
            <FaArrowLeft className="mr-2" /> Volver al Dashboard
          </button>
          <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200">
            <h2 className="text-xl font-semibold text-yellow-700 mb-2">Empresa no encontrada</h2>
            <p className="text-yellow-600">No se encontró la empresa solicitada o no tienes acceso a ella.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Editar Empresa | {company.name} | Total Awareness</title>
      </Head>
      
      <NavBar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button 
          onClick={goBack} 
          className="flex items-center text-blue-600 mb-8 hover:underline"
        >
          <FaArrowLeft className="mr-2" /> Volver al Dashboard
        </button>
        
        <div className="bg-white shadow-md rounded-xl overflow-hidden">
          <div className="p-6">
            <div className="flex items-center mb-8">
              <div className="bg-blue-100 rounded-full p-4 mr-4">
                <FaBuilding className="text-blue-600 text-3xl" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800">Editar Empresa</h1>
            </div>
            
            {error && (
              <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-md text-red-600">
                {error}
              </div>
            )}
            
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la empresa *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ingresa el nombre de la empresa"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Descripción opcional"
                  rows={4}
                />
              </div>
              
              {/* Solo mostrar la opción de público/privado al propietario */}
              {company.isOwner && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                    Empresa pública (cualquier usuario puede unirse sin aprobación)
                  </label>
                </div>
              )}
              
              <div className="flex justify-between pt-6 border-t">
                <div>
                  {company.isOwner && (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                    >
                      <FaTrash className="mr-2" /> Eliminar empresa
                    </button>
                  )}
                </div>
                
                <div>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="px-8 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center disabled:bg-blue-400 disabled:cursor-not-allowed"
                  >
                    <FaSave className="mr-2" /> 
                    {saving ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* Modal de confirmación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4 text-red-600">
              ¿Estás seguro de eliminar esta empresa?
            </h3>
            
            <p className="mb-6 text-gray-600">
              Esta acción eliminará permanentemente la empresa <strong>{company.name}</strong> y todos sus datos asociados. Esta acción no se puede deshacer.
            </p>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                {saving ? "Eliminando..." : "Sí, eliminar empresa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}