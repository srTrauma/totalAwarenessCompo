import { useState } from 'react';

interface Role {
  id: number;
  name: string;
  level: number;
  description?: string | null;
}

interface RoleSelectorProps {
  roles: Role[];
  currentRoleId: number;
  onSave: (roleId: number) => Promise<void> | void;
  onCancel: () => void;
}

export default function RoleSelector({ roles, currentRoleId, onSave, onCancel }: RoleSelectorProps) {
  const [selectedRoleId, setSelectedRoleId] = useState(currentRoleId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSave = async () => {
    if (selectedRoleId === currentRoleId) {
      onCancel();
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSave(selectedRoleId);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <select
        className="block w-full pl-3 pr-10 py-1 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        value={selectedRoleId}
        onChange={(e) => setSelectedRoleId(Number(e.target.value))}
        disabled={isSubmitting}
      >
        {roles.map((role) => (
          <option key={role.id} value={role.id}>
            {role.name}
          </option>
        ))}
      </select>
      
      <div className="flex space-x-1">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSubmitting}
          className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </button>
        
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}