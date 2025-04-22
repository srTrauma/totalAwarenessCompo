import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import NavBar from "@/components/NavBar";
import { FaUsers, FaCrown, FaUserShield, FaUser, FaUserClock, FaCheck, FaTimes, FaTrash, FaEdit } from "react-icons/fa";
import "@/app/globals.css";

interface Role {
  id: number;
  name: string;
  description: string | null;
  level: number;
}

interface Member {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  role: Role;
  approved: boolean;
  joinedAt: string;
}

export default function ManageMembers() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null);
  const [company, setCompany] = useState<{ id: number; name: string; ownerId: number } | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [error, setError] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState<Role | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const selectedCompany = localStorage.getItem("selectedCompany");
    
    if (!storedUser || !selectedCompany) {
      router.push("/CompanySelection");
      return;
    }

    setUser(JSON.parse(storedUser));
    // Obtener información de la empresa seleccionada
    fetchCompanyDetails(Number(selectedCompany));
  }, [router]);

  useEffect(() => {
    // Cuando tengamos la información de la empresa, cargar los miembros
    if (company && user) {
      fetchMembers();
      fetchRoles();
    }
  }, [company, user]);

  async function fetchCompanyDetails(companyId: number) {
    try {
      const response = await fetch(`/api/companies/detail?companyId=${companyId}`, {
        headers: {
          userid: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!).id : ""
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCompany({
          id: data.id,
          name: data.name,
          ownerId: data.owner.id
        });
        setCurrentUserRole(data.currentUserRole);
        
        // Si no es propietario ni admin, redirigir
        if (data.currentUserRole.level > 2) {
          alert("No tienes permisos para gestionar miembros de esta empresa");
          router.push("/Dashboard");
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Error al cargar detalles de la empresa");
        router.push("/CompanySelection");
      }
    } catch (error) {
      console.error("Error:", error);
      router.push("/CompanySelection");
    }
  }

  async function fetchMembers() {
    try {
      setLoading(true);
      const response = await fetch(`/api/companies/members?companyId=${company!.id}`, {
        headers: {
          userid: user!.id.toString()
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Error al cargar los miembros de la empresa");
      }
    } catch (error) {
      console.error("Error al cargar miembros:", error);
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  }

  async function fetchRoles() {
    try {
      const response = await fetch(`/api/roles/list`, {
        headers: {
          userid: user!.id.toString()
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      } else {
        console.error("Error al cargar roles");
      }
    } catch (error) {
      console.error("Error al cargar roles:", error);
    }
  }

  async function handleApprove(member: Member) {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/companies/members`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          userid: user!.id.toString()
        },
        body: JSON.stringify({
          membershipId: member.id,
          approved: true
        })
      });
      
      if (response.ok) {
        // Actualizar la lista de miembros
        await fetchMembers();
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Error al aprobar solicitud");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al conectar con el servidor");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject(member: Member) {
    if (!confirm("¿Estás seguro de que quieres rechazar esta solicitud?")) {
      return;
    }
    
    try {
      setActionLoading(true);
      const response = await fetch(`/api/companies/members`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          userid: user!.id.toString()
        },
        body: JSON.stringify({
          membershipId: member.id,
          approved: false
        })
      });
      
      if (response.ok) {
        // Actualizar la lista de miembros
        await fetchMembers();
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Error al rechazar solicitud");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al conectar con el servidor");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRemoveMember(member: Member) {
    if (!confirm(`¿Estás seguro de que quieres eliminar a ${member.user.name} de la empresa?`)) {
      return;
    }
    
    try {
      setActionLoading(true);
      const response = await fetch(`/api/companies/members`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          userid: user!.id.toString()
        },
        body: JSON.stringify({
          membershipId: member.id
        })
      });
      
      if (response.ok) {
        // Actualizar la lista de miembros
        await fetchMembers();
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Error al eliminar miembro");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al conectar con el servidor");
    } finally {
      setActionLoading(false);
    }
  }

  function openRoleModal(member: Member) {
    setSelectedMember(member);
    setSelectedRole(member.role.id);
    setShowRoleModal(true);
  }

  async function updateRole() {
    if (!selectedMember || !selectedRole) return;
    
    try {
      setActionLoading(true);
      const response = await fetch(`/api/companies/members`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          userid: user!.id.toString()
        },
        body: JSON.stringify({
          membershipId: selectedMember.id,
          roleId: selectedRole
        })
      });
      
      if (response.ok) {
        setShowRoleModal(false);
        await fetchMembers();
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Error al cambiar rol");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al conectar con el servidor");
    } finally {
      setActionLoading(false);
    }
  }

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case "OWNER":
        return <FaCrown className="text-yellow-500" />;
      case "ADMIN":
        return <FaUserShield className="text-purple-500" />;
      case "MEMBER":
        return <FaUser className="text-blue-500" />;
      case "VIEWER":
        return <FaUser className="text-gray-500" />;
      default:
        return <FaUser className="text-blue-500" />;
    }
  };

  if (loading && !members.length) {
    return (
      <>
        <Head>
          <title>Gestión de Miembros | Total Awareness</title>
        </Head>
        <NavBar />
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Gestión de Miembros | Total Awareness</title>
      </Head>
      
      <NavBar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Miembros</h1>
            <p className="text-gray-600">
              {company?.name} - {members.length} miembros
            </p>
          </div>
          
          <button
            onClick={() => router.push("/Dashboard")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Volver al Dashboard
          </button>
        </div>
        
        {error && (
          <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-md text-red-600">
            {error}
          </div>
        )}
        
        {/* Sección de solicitudes pendientes */}
        {members.some(m => !m.approved) && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FaUserClock className="mr-2 text-yellow-500" />
              Solicitudes pendientes
            </h2>
            
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
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
                        Fecha solicitud
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {members
                      .filter(member => !member.approved)
                      .map(member => (
                        <tr key={member.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{member.user.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-gray-500">{member.user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-gray-500">
                              {new Date(member.joinedAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleApprove(member)}
                              disabled={actionLoading}
                              className="text-green-600 hover:text-green-900 mr-4"
                            >
                              <FaCheck className="inline mr-1" /> Aprobar
                            </button>
                            <button
                              onClick={() => handleReject(member)}
                              disabled={actionLoading}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FaTimes className="inline mr-1" /> Rechazar
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {/* Lista de miembros aprobados */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaUsers className="mr-2 text-blue-500" />
            Miembros
          </h2>
          
          {members.some(m => m.approved) ? (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
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
                        Desde
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {members
                      .filter(member => member.approved)
                      .map(member => (
                        <tr key={member.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">
                              {member.user.name}
                              {member.user.id === company?.ownerId && (
                                <span className="ml-2 text-yellow-500">(Propietario)</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-gray-500">{member.user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="mr-2">{getRoleIcon(member.role.name)}</span>
                              <span>{member.role.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-gray-500">
                              {new Date(member.joinedAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {/* No mostrar acciones para el propietario */}
                            {member.user.id !== company?.ownerId && (
                              <>
                                {/* Solo permitir cambio de rol si eres propietario o si tu nivel es menor (mayor permisos) que el miembro */}
                                {(user?.id === company?.ownerId || 
                                  (currentUserRole && currentUserRole.level < member.role.level)) && (
                                  <button
                                    onClick={() => openRoleModal(member)}
                                    disabled={actionLoading}
                                    className="text-blue-600 hover:text-blue-900 mr-4"
                                  >
                                    <FaEdit className="inline mr-1" /> Cambiar rol
                                  </button>
                                )}
                                
                                <button
                                  onClick={() => handleRemoveMember(member)}
                                  disabled={actionLoading}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <FaTrash className="inline mr-1" /> Eliminar
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg p-8 text-center">
              <FaUsers className="mx-auto text-gray-400 text-5xl mb-4" />
              <p className="text-gray-500">No hay miembros aprobados en esta empresa.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal para cambiar rol */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">
              Cambiar rol de {selectedMember?.user.name}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecciona un rol
              </label>
              <select
                value={selectedRole || ""}
                onChange={(e) => setSelectedRole(Number(e.target.value))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:border-blue-300"
              >
                {roles
                  // Filtrar para que los ADMIN no puedan asignar roles de OWNER o ADMIN
                  .filter(role => 
                    user?.id === company?.ownerId || role.level > 2
                  )
                  .map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name} {role.description ? `- ${role.description}` : ""}
                    </option>
                  ))
                }
              </select>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowRoleModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={updateRole}
                disabled={actionLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                {actionLoading ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}