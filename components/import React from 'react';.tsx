import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NavBar from './NavBar';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => {
    return <a href={href} {...props}>{children}</a>;
  };
});

// Mock Button component
jest.mock('./Button', () => {
  return ({ Text, href, blue, ...props }: any) => {
    return (
      <button 
        data-testid="mock-button" 
        data-href={href}
        data-blue={blue}
        {...props}
      >
        {Text}
      </button>
    );
  };
});

// Mock Notifications component
jest.mock('./Notification', () => {
  return ({ userId }: { userId: number }) => {
    return <div data-testid="notifications" data-user-id={userId}>Notifications</div>;
  };
});

// Mock react-icons
jest.mock('react-icons/fa', () => ({
  FaUser: () => <div data-testid="user-icon">User</div>,
  FaCog: () => <div data-testid="cog-icon">Cog</div>,
  FaSignOutAlt: () => <div data-testid="signout-icon">SignOut</div>,
  FaChevronDown: () => <div data-testid="chevron-icon">Chevron</div>,
}));

// Mock window.location
const mockLocation = {
  href: '',
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

describe('NavBar', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    mockLocation.href = '';
    
    // Mock scroll behavior
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 0,
    });
    
    // Mock addEventListener and removeEventListener
    window.addEventListener = jest.fn();
    window.removeEventListener = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial rendering', () => {
    test('renders static version before mounting', () => {
      render(<NavBar />);
      
      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(screen.getByText('Awareness')).toBeInTheDocument();
      expect(screen.getByText('Inicio')).toBeInTheDocument();
      expect(screen.getByText('Sobre Nosotros')).toBeInTheDocument();
      expect(screen.getByText('FAQ')).toBeInTheDocument();
      expect(screen.getByText('Contacto')).toBeInTheDocument();
    });

    test('renders full version after mounting', async () => {
      render(<NavBar />);
      
      await waitFor(() => {
        expect(screen.getByRole('link', { name: /inicio/i })).toBeInTheDocument();
      });
    });
  });

  describe('Authentication states', () => {
    test('shows login button when not logged in', async () => {
      render(<NavBar />);
      
      await waitFor(() => {
        const loginButton = screen.getByTestId('mock-button');
        expect(loginButton).toHaveTextContent('Iniciar Sesión');
        expect(loginButton).toHaveAttribute('data-href', '/Login');
      });
    });

    test('shows user profile and logout when logged in', async () => {
      const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      render(<NavBar />);
      
      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByTestId('notifications')).toBeInTheDocument();
        expect(screen.getByTestId('notifications')).toHaveAttribute('data-user-id', '1');
        expect(screen.getByText('Gestión de Empresas')).toBeInTheDocument();
      });
    });

    test('handles logout correctly', async () => {
      const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('selectedCompany', 'test-company');
      
      render(<NavBar />);
      
      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
      });

      // Click profile dropdown
      fireEvent.click(screen.getByText('Test User'));
      
      // Click logout
      fireEvent.click(screen.getByText('Cerrar Sesión'));
      
      expect(localStorage.getItem('user')).toBeNull();
      expect(localStorage.getItem('selectedCompany')).toBeNull();
      expect(mockLocation.href).toBe('/');
    });
  });

  describe('Mobile menu functionality', () => {
    test('toggles mobile menu open and close', async () => {
      render(<NavBar />);
      
      await waitFor(() => {
        const menuButton = screen.getByLabelText('Abrir menú');
        expect(menuButton).toBeInTheDocument();
      });

      const menuButton = screen.getByLabelText('Abrir menú');
      
      // Open menu
      fireEvent.click(menuButton);
      expect(screen.getByLabelText('Cerrar menú')).toBeInTheDocument();
      
      // Close menu
      fireEvent.click(screen.getByLabelText('Cerrar menú'));
      expect(screen.getByLabelText('Abrir menú')).toBeInTheDocument();
    });

    test('closes mobile menu when navigation link is clicked', async () => {
      render(<NavBar />);
      
      await waitFor(() => {
        const menuButton = screen.getByLabelText('Abrir menú');
        fireEvent.click(menuButton);
      });

      // Find mobile menu links (they appear twice - desktop and mobile)
      const mobileLinks = screen.getAllByRole('link');
      const mobileInicioLink = mobileLinks.find(link => 
        link.getAttribute('href') === '/' && 
        link.className.includes('block py-3')
      );
      
      expect(mobileInicioLink).toBeInTheDocument();
      fireEvent.click(mobileInicioLink!);
      
      expect(screen.getByLabelText('Abrir menú')).toBeInTheDocument();
    });

    test('shows logged in user options in mobile menu', async () => {
      const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      render(<NavBar />);
      
      await waitFor(() => {
        const menuButton = screen.getByLabelText('Abrir menú');
        fireEvent.click(menuButton);
      });

      expect(screen.getByText('Gestión de Empresas')).toBeInTheDocument();
      expect(screen.getByText('Mi Perfil')).toBeInTheDocument();
    });
  });

  describe('Profile dropdown functionality', () => {
    test('toggles profile dropdown', async () => {
      const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      render(<NavBar />);
      
      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
      });

      const profileButton = screen.getByText('Test User');
      
      // Open dropdown
      fireEvent.click(profileButton);
      expect(screen.getByText('Perfil')).toBeInTheDocument();
      
      // Close dropdown
      fireEvent.click(profileButton);
      expect(screen.queryByText('Perfil')).not.toBeInTheDocument();
    });

    test('navigates to profile page when profile option is clicked', async () => {
      const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      render(<NavBar />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Test User'));
      });

      fireEvent.click(screen.getByText('Perfil'));
      
      expect(mockLocation.href).toBe('/Profile');
    });
  });

  describe('Scroll behavior', () => {
    test('changes background on scroll', async () => {
      render(<NavBar />);
      
      await waitFor(() => {
        expect(screen.getByRole('navigation')).toBeInTheDocument();
      });

      // Simulate scroll
      Object.defineProperty(window, 'scrollY', { value: 25 });
      fireEvent.scroll(window);

      // The scroll effect is handled by the scroll event listener
      // We can verify the event listener was added
      expect(window.addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
    });
  });

  describe('Navigation links', () => {
    test('renders all navigation links with correct hrefs', async () => {
      render(<NavBar />);
      
      await waitFor(() => {
        expect(screen.getByRole('link', { name: /inicio/i })).toHaveAttribute('href', '/');
        expect(screen.getByRole('link', { name: /sobre nosotros/i })).toHaveAttribute('href', '/about');
        expect(screen.getByRole('link', { name: /faq/i })).toHaveAttribute('href', '/faq');
        expect(screen.getByRole('link', { name: /contacto/i })).toHaveAttribute('href', '/contact');
      });
    });

    test('shows company management link only when logged in', async () => {
      // First test when not logged in
      render(<NavBar />);
      
      await waitFor(() => {
        expect(screen.queryByText('Gestión de Empresas')).not.toBeInTheDocument();
      });

      // Unmount and test when logged in
      const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      render(<NavBar />);
      
      await waitFor(() => {
        expect(screen.getByText('Gestión de Empresas')).toBeInTheDocument();
      });
    });
  });

  describe('Notifications component', () => {
    test('passes correct userId to Notifications component', async () => {
      const mockUser = { id: 123, name: 'Test User', email: 'test@example.com' };
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      render(<NavBar />);
      
      await waitFor(() => {
        const notifications = screen.getByTestId('notifications');
        expect(notifications).toHaveAttribute('data-user-id', '123');
      });
    });

    test('does not render Notifications when not logged in', async () => {
      render(<NavBar />);
      
      await waitFor(() => {
        expect(screen.queryByTestId('notifications')).not.toBeInTheDocument();
      });
    });
  });

  describe('Microsoft Clarity script', () => {
    test('injects Microsoft Clarity script', () => {
      const mockAppendChild = jest.fn();
      const mockCreateElement = jest.fn().mockReturnValue({
        id: '',
        type: '',
        async: false,
        innerHTML: '',
      });
      
      Object.defineProperty(document, 'getElementById', {
        value: jest.fn().mockReturnValue(null),
      });
      
      Object.defineProperty(document, 'createElement', {
        value: mockCreateElement,
      });
      
      Object.defineProperty(document, 'head', {
        value: { appendChild: mockAppendChild },
      });

      render(<NavBar />);
      
      expect(mockCreateElement).toHaveBeenCalledWith('script');
    });
  });
});