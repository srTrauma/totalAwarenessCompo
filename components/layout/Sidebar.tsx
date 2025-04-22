import Link from 'next/link';

export default function Sidebar() {
  return (
    <div className="w-64 bg-white shadow-md pt-6 pb-8 px-4">
      <nav className="mt-5">
        <Link href="/dashboard" legacyBehavior>
          <a className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-50">
            Dashboard
          </a>
        </Link>
        <Link href="/companies" legacyBehavior>
          <a className="mt-1 group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-50">
            Mis Empresas
          </a>
        </Link>
        <Link href="/companies/public" legacyBehavior>
          <a className="mt-1 group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-50">
            Empresas Públicas
          </a>
        </Link>
        <Link href="/companies/create" legacyBehavior>
          <a className="mt-1 group flex items-center px-3 py-2 text-sm font-medium rounded-md text-blue-700 hover:text-blue-900 hover:bg-blue-50">
            Crear Empresa
          </a>
        </Link>
      </nav>
    </div>
  );
}