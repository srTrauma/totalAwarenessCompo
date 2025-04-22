import { useState } from 'react';
import RoleSelector from './RoleSelector';


interface Role {
  id: number;
  name: string;
  level: number;
  description?: string | null;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface Member {
  id: number;
  userId: number;
  approved: boolean;
  joinedAt: string;
  user: User;
  role: Role;
}

interface MembersListProps {
  members: Member[];
  pendingRequests?: Member[];
  companyOwnerId: number;
  currentUserId: number;
  roles: Role[];
  onApprove?: (membershipId: number) => Promise<void>;
  onReject?: (membershipId: number) => Promise<void>;
  onRemove: (membershipId: number) => Promise<void>;
  onUpdateRole?: (membershipId: number, roleId: number) => Promise<void>;
}

export default function MembersList({ 
  members, 
  pendingRequests = [], 
  companyOwnerId,
  currentUserId,
  roles,
  onApprove,
  onReject,
  onRemove,
  onUpdateRole 
}: MembersListProps) {
  const [activeTab, setActiveTab] = useState('members');
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);

  const handleRoleChange = async (membershipId: number, roleId: number) => {
    if (onUpdateRole) {
      await onUpdateRole(membershipId, roleId);
      setEditingRoleId(null);
    }
  };

  return (
    <div>
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Seleccionar vista
        </label>
        <select
          id="tabs"
          name="tabs"
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
        >
          <option value="members">Miembros ({members.length})</option>
          <option value="pending">Solicitudes pendientes ({pendingRequests.length})</option>
        </select>
      </div>
      
      <div className="hidden sm:block">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('members')}
              className={`
                ${activeTab === 'members'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              `}
            >
              Miembros ({members.length})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`
                ${activeTab === 'pending'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              `}
            >
              Solicitudes pendientes ({pendingRequests.length})
            </button>
          </nav>
        </div>
      </div>
      
      <div className="mt-6">
        {activeTab === 'members' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de unión
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.map((member) => {
                  const isOwner = member.userId === companyOwnerId;
                  const isSelf = member.userId === currentUserId;
                  
                  return (
                    <tr key={member.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {member.user.name}
                              {isOwner && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  Propietario
                                </span>
                              )}
                              {isSelf && !isOwner && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Tú
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{member.user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingRoleId === member.id ? (
                          <RoleSelector
                            roles={roles.filter(r => r.level > 1)} // Excluir el rol de OWNER
                            currentRoleId={member.role.id}
                            onSave={(roleId) => handleRoleChange(member.id, roleId)}
                            onCancel={() => setEditingRoleId(null)}
                          />
                        ) : (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            member.role.level === 1 ? 'bg-purple-100 text-purple-800' :
                            member.role.level === 2 ? 'bg-red-100 text-red-800' :
                            member.role.level === 3 ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {member.role.name}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(member.joinedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {currentUserId === companyOwnerId && !isOwner && (
                          <button
                            onClick={() => setEditingRoleId(member.id)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Cambiar rol
                          </button>
                        )}
                        
                        {(!isOwner || isSelf) && (
                          <button
                            onClick={() => onRemove(member.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            {isSelf ? 'Salir' : 'Eliminar'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {members.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      No hay miembros en esta empresa
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de solicitud
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingRequests.map((request) => (
                  <tr key={request.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{request.user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{request.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.joinedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {onApprove && onReject && (
                        <>
                          <button
                            onClick={() => onApprove(request.id)}
                            className="text-green-600 hover:text-green-900 mr-4"
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => onReject(request.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Rechazar
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {pendingRequests.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                      No hay solicitudes pendientes
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
