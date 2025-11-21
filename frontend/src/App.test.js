import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

// -----------------------------------------------------------------------------
// 1. Mocks de Componentes Hijos
// Simulamos los componentes para no testear su lógica interna, sino la integración con App
// -----------------------------------------------------------------------------
vi.mock('./componentes/Auth', () => ({
  default: ({ enLoginExitoso }) => (
    <div data-testid="auth-component">
      <h1>Login Screen</h1>
      <button onClick={() => enLoginExitoso('fake-test-token')}>Simular Login</button>
    </div>
  ),
}));

vi.mock('./componentes/AdminDashboard', () => ({
  default: ({ onSalirClick }) => (
    <div data-testid="admin-dashboard">
      <h1>Panel Admin</h1>
      <button onClick={onSalirClick}>Cerrar Sesión Admin</button>
    </div>
  ),
}));

vi.mock('./componentes/MapaJurassic', () => ({
  default: ({ onSalirClick }) => (
    <div data-testid="mapa-jurassic">
      <h1>Mapa del Parque</h1>
      <button onClick={onSalirClick}>Cerrar Sesión Usuario</button>
    </div>
  ),
}));

vi.mock('./componentes/IntroAnimacion', () => ({
  default: ({ onEmpezar }) => (
    <div data-testid="intro-animacion">
      <button onClick={onEmpezar}>Saltar Intro</button>
    </div>
  ),
}));

// Mock de componentes simples para evitar errores de renderizado
vi.mock('./componentes/Registro', () => ({ default: () => <div>Registro</div> }));
vi.mock('./componentes/ForceChangePassword', () => ({ default: () => <div>Change Pass</div> }));
vi.mock('./componentes/VerificarEmail', () => ({ default: () => <div>Verify Email</div> }));
vi.mock('./componentes/ModalConfirmacion', () => ({
  default: ({ isOpen, onConfirm }) => isOpen ? (
    <div data-testid="modal-confirmacion">
      <button onClick={onConfirm}>Confirmar Logout</button>
    </div>
  ) : null
}));
// Mock de modales vacíos para que no interfieran
vi.mock('./componentes/DinoModal', () => ({ default: () => null }));
vi.mock('./componentes/LabModal', () => ({ default: () => null }));
vi.mock('./componentes/JeepModal', () => ({ default: () => null }));
vi.mock('./componentes/GuardasModal', () => ({ default: () => null }));
vi.mock('./componentes/RequestPasswordReset', () => ({ default: () => <div>Request Reset</div> }));
vi.mock('./componentes/ResetPassword', () => ({ default: () => <div>Do Reset</div> }));

// -----------------------------------------------------------------------------
// 2. Setup Global (Audio y Fetch)
// -----------------------------------------------------------------------------

// El navegador tiene objeto Audio, pero JSDOM (el entorno de test) no. Lo simulamos.
const mockAudioPlay = vi.fn().mockResolvedValue(undefined);
const mockAudioPause = vi.fn();

global.Audio = vi.fn().mockImplementation(() => ({
  play: mockAudioPlay,
  pause: mockAudioPause,
  preload: '',
  loop: false,
  currentTime: 0,
}));

describe('App Component Integration Tests', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();

    // Evitar que salga la intro por defecto en cada test (la activamos solo cuando queremos probarla)
    sessionStorage.setItem('haVistoIntro', 'true');

    // Mock por defecto de fetch para devolver respuestas vacías pero exitosas
    global.fetch = vi.fn((url) => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ---------------------------------------------------------------------------
  // 3. Tests
  // ---------------------------------------------------------------------------

  it('Muestra la intro si el usuario no la ha visto (sessionStorage vacío)', () => {
    sessionStorage.removeItem('haVistoIntro');

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('intro-animacion')).toBeInTheDocument();
  });

  it('Muestra "Cargando..." inicialmente y luego redirige al Login si no hay token', async () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    // 1. Verificar estado de carga inicial
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();

    // 2. Esperar a que termine de "cargar" (el useEffect de App)
    await waitFor(() => {
      expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument();
    });

    // 3. Debería mostrar el componente de Auth (Login)
    expect(screen.getByTestId('auth-component')).toBeInTheDocument();
  });

  it('Carga datos y muestra el Mapa si el usuario es normal (role: user)', async () => {
    // Setup: Token existente
    localStorage.setItem('jurassic_token', 'valid-token');

    // Mock de las respuestas de la API específicas para este caso
    global.fetch = vi.fn((url) => {
      if (url.includes('/auth/me')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ username: 'Pepe', role: 'user' })
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    render(
      <MemoryRouter initialEntries={['/mapa']}>
        <App />
      </MemoryRouter>
    );

    // Esperar a que desaparezca el loading
    await waitFor(() => expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument());

    // Verificar que se renderiza el Mapa
    expect(screen.getByTestId('mapa-jurassic')).toBeInTheDocument();
    // Verificar que NO se renderiza el Dashboard de admin
    expect(screen.queryByTestId('admin-dashboard')).not.toBeInTheDocument();
  });

  it('Carga datos y redirige al Admin Dashboard si el usuario es admin', async () => {
    localStorage.setItem('jurassic_token', 'admin-token');

    global.fetch = vi.fn((url) => {
      if (url.includes('/auth/me')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ username: 'AdminJhon', role: 'admin' })
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    render(
      <MemoryRouter initialEntries={['/mapa']}> {/* Intentamos entrar al mapa */}
        <App />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument());

    // Debería redirigir automágicamente al Dashboard aunque intentamos ir a /mapa
    expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument();
  });

  it('Maneja el cierre de sesión correctamente', async () => {
    // 1. Iniciar como logueado
    localStorage.setItem('jurassic_token', 'user-token');
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ role: 'user' })
    });

    render(
      <MemoryRouter initialEntries={['/mapa']}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByTestId('mapa-jurassic'));

    // 2. Simular click en "Salir" (botón dentro del mock de MapaJurassic)
    fireEvent.click(screen.getByText('Cerrar Sesión Usuario'));

    // 3. Verificar que aparece el modal de confirmación
    expect(screen.getByTestId('modal-confirmacion')).toBeInTheDocument();

    // 4. Confirmar en el modal
    fireEvent.click(screen.getByText('Confirmar Logout'));

    // 5. Verificar que el token se borró y volvimos al login
    await waitFor(() => {
      expect(localStorage.getItem('jurassic_token')).toBeNull();
      expect(screen.getByTestId('auth-component')).toBeInTheDocument();
    });
  });

  it('Maneja error de token inválido redirigiendo al login', async () => {
    localStorage.setItem('jurassic_token', 'invalid-token');

    // Simular error 401 o similar desde el backend
    global.fetch = vi.fn((url) => {
        return Promise.resolve({
          ok: false, // Error en la petición
          status: 401
        });
    });

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument());

    // Debería haber borrado el token inválido
    expect(localStorage.getItem('jurassic_token')).toBeNull();
    // Debería mostrar login
    expect(screen.getByTestId('auth-component')).toBeInTheDocument();
  });
});