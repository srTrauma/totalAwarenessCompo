"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { FaBuilding, FaUsers, FaEye } from "react-icons/fa";
import Button from "@/components/Button";

interface PublicCompany {
  id: number;
  name: string;
  description: string | null;
  ownerName: string;
  memberCount: number;
  createdAt: string;
}

export default function PublicCompanies() {
  const router = useRouter();
  const [companies, setCompanies] = useState<PublicCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPublicCompanies();
  }, []);

  async function fetchPublicCompanies() {
    try {
      setLoading(true);
      const response = await fetch("/api/companies/public");
      
      if (response.ok) {
        const data = await response.json();
        setCompanies(data.slice(0, 4)); // Mostrar máximo 4 empresas en la landing
      } else {
        console.error("Error al cargar empresas públicas");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Empresas destacadas</h2>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !companies.length) {
    return null; // No mostrar nada si hay error o no hay empresas
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Empresas destacadas</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {companies.map(company => (
            <div
              key={company.id}
              className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105"
            >
              <div className="p-5">
                <div className="flex items-center mb-3">
                  <div className="bg-blue-100 rounded-full p-2 mr-3">
                    <FaBuilding className="text-blue-600" size={16} />
                  </div>
                  <h3 className="font-semibold text-lg truncate">{company.name}</h3>
                </div>
                
                {company.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {company.description}
                  </p>
                )}
                
                <div className="flex items-center text-sm text-gray-500 mt-3">
                  <FaUsers className="mr-1" />
                  <span className="mr-3">{company.memberCount}</span>
                  <span>Por {company.ownerName}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <div onClick={() => router.push("/companies/explore")}>
            <Button Text="Explorar más empresas" blue />
          </div>
        </div>
      </div>
    </section>
  );
}