import { useState, useEffect } from 'react';
import { FaBuilding, FaChevronDown } from 'react-icons/fa';

interface Company {
  id: number;
  name: string;
  description: string | null;
  public: boolean;
}

interface CompanySelectorProps {
  userId: number;
  selectedCompanyId: number | null;
  onCompanyChange: (companyId: number) => void;
  className?: string;
}

export default function CompanySelector({ 
  userId, 
  selectedCompanyId, 
  onCompanyChange, 
  className = "" 
}: CompanySelectorProps) {
  const [ownedCompanies, setOwnedCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchOwnedCompanies();
  }, [userId]);
  const fetchOwnedCompanies = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/companies/list?userId=${userId}`);

      if (response.ok) {
        const companies = await response.json();
        setOwnedCompanies(companies);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al cargar empresas');
      }
    } catch (error) {
      console.error('Error al cargar empresas:', error);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const selectedCompany = ownedCompanies.find(company => company.id === selectedCompanyId);

  // No mostrar selector si el usuario no tiene múltiples empresas
  if (loading || ownedCompanies.length <= 1) {
    return null;
  }

  if (error) {
    return (
      <div className={`text-red-600 text-sm ${className}`}>
        {error}
      </div>
    );
  }
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center w-full px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      >
        <FaBuilding className="text-gray-400 mr-2 sm:mr-3 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">
            {selectedCompany?.name || 'Seleccionar empresa'}
          </div>
          {selectedCompany?.description && (
            <div className="text-xs text-gray-500 truncate hidden sm:block">
              {selectedCompany.description}
            </div>
          )}
        </div>
        <FaChevronDown 
          className={`ml-2 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          {/* Overlay para cerrar cuando se hace clic fuera */}
          <div 
            className="fixed inset-0 z-30" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown con mejor posicionamiento responsive */}
          <div className="absolute z-40 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {ownedCompanies.map((company) => (
              <button
                key={company.id}
                onClick={() => {
                  onCompanyChange(company.id);
                  setIsOpen(false);
                }}
                className={`w-full px-3 sm:px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors ${
                  company.id === selectedCompanyId ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-center">
                  <FaBuilding className="text-gray-400 mr-2 sm:mr-3 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {company.name}
                    </div>
                    {company.description && (
                      <div className="text-xs text-gray-500 truncate hidden sm:block">
                        {company.description}
                      </div>
                    )}
                    <div className="flex items-center mt-1">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                        company.public ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {company.public ? 'Pública' : 'Privada'}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
