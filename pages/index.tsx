import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div style={{ 
      padding: '50px', 
      textAlign: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1 style={{ 
        fontSize: '2.5rem', 
        marginBottom: '20px',
        color: '#333'
      }}>
        ¡Bienvenido a Total Awareness!
      </h1>
      
      <p style={{ 
        fontSize: '1.2rem', 
        marginBottom: '40px',
        color: '#666'
      }}>
        Tu aplicación está funcionando correctamente
      </p>
      
      <nav style={{ marginTop: '40px' }}>
        <div style={{ 
          display: 'flex', 
          gap: '20px', 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <Link href="/Login" style={{ 
            padding: '12px 24px',
            backgroundColor: '#0070f3',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '16px'
          }}>
            Login
          </Link>
          
          <Link href="/about" style={{ 
            padding: '12px 24px',
            backgroundColor: '#0070f3',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '16px'
          }}>
            Acerca de
          </Link>
          
          <Link href="/companies/explore" style={{ 
            padding: '12px 24px',
            backgroundColor: '#0070f3',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '16px'
          }}>
            Explorar Empresas
          </Link>
          
          <Link href="/workspaces" style={{ 
            padding: '12px 24px',
            backgroundColor: '#0070f3',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '16px'
          }}>
            Espacios de Trabajo
          </Link>
          
          <Link href="/tasks" style={{ 
            padding: '12px 24px',
            backgroundColor: '#0070f3',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '16px'
          }}>
            Tareas
          </Link>
        </div>
      </nav>
    </div>
  );
}
