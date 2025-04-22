import { useState } from 'react';
import { useRouter } from 'next/router';

interface CompanyCardProps {
  company: {
    id: number;
    name: string;
    description: string | null;
    ownerName?: string;
    memberCount?: number;
    createdAt: string;
    public?: boolean;
    approved?: boolean;
    isOwner?: boolean;
  };
  onJoin?: () => void;
  showJoinButton?: boolean;
}

export default function CompanyCard({ company, onJoin, showJoinButton = false }: CompanyCardProps) {
  const [isJoining, setIsJoining] = useState(false);
  const router = useRouter();
  
  const handleJoinClick = async () => {
    if (!onJoin) return;
    setIsJoining(true);
    try {
      await onJoin();
    } finally {
      setIsJoining(false);
    }
  };

  const handleViewDetails = () => {
    router.push(`/companies/${company.id}`);
  };

  return (
    <div className="bg-white shadow overflow-hidden rounded-lg">
      <div className="p-5">
        <div className="flex justify-between">
          <h3 className="text-lg font-medium text-gray-900 truncate">{company.name}</h3>
          {company.public !== undefined && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              company.public ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {company.public ? 'Pública' : 'Privada'}
            </span>
          )}
        </div>
        
        {company.description && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
            {company.description}
          </p>
        )}
        
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-500">
          {company.ownerName && (
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Propietario: {company.ownerName}
            </span>
          )}
          
          {company.memberCount !== undefined && (
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {company.memberCount} {company.memberCount === 1 ? 'miembro' : 'miembros'}
            </span>
          )}
          
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date(company.createdAt).toLocaleDateString()}
          </span>
          
          {company.approved === false && (
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md">
              Pendiente de aprobación
            </span>
          )}
        </div>
        
        <div className="mt-5 flex justify-end space-x-3">
          <button
            onClick={handleViewDetails}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Ver detalles
          </button>
          
          {showJoinButton && (
            <button
              onClick={handleJoinClick}
              disabled={isJoining}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isJoining ? 'Enviando...' : 'Unirme'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}