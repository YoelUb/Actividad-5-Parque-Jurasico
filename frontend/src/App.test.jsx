import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

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

vi.mock('./componentes/Registro', () => ({ default: () => <divs>Registro</divs> }));
vi.mock('./componentes/ForceChangePassword', () => ({ default: () => <div>Change Pass</div> }));
vi.mock('./componentes/VerificarEmail', () => ({ default: () => <div>Verify Email</div> }));
vi.mock('./componentes/ModalConfirmacion', () => ({
  default: ({ isOpen, onConfirm }) => isOpen ? (
    <div data-testid="modal-confirmacion">
      <button onClick={onConfirm}>Confirmar Logout</button>
    </div>
  ) : null
}));

vi.mock('./componentes/DinoModal', () => ({ default: () => null }));
vi.mock('./componentes/LabModal', () => ({ default: () => null }));
vi.mock('./componentes/JeepModal', () => ({ default: () => null }));
vi.mock('./componentes/GuardasModal', () => ({ default: () => null }));
vi.mock('./componentes/RequestPasswordReset', () => ({ default: () => <div>Request Reset</div> }));
vi.mock('./componentes/ResetPassword', () => ({ default: () => <div>Do Reset</div> }));


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

    // Evitar que salga la intro por defecto en cada test
    sessionStorage.setItem('haVistoIntro', 'true');

    // Mock por defecto de fetch
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


    await waitFor(() => {
      expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('auth-component')).toBeInTheDocument();
  });

  it('Carga datos y muestra el Mapa si el usuario es normal (role: user)', async () => {
    localStorage.setItem('jurassic_token', 'valid-token');

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

    await waitFor(() => expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument());

    expect(screen.getByTestId('mapa-jurassic')).toBeInTheDocument();
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
      <MemoryRouter initialEntries={['/mapa']}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument());

    expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument();
  });

  it('Maneja el cierre de sesión correctamente', async () => {
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

    fireEvent.click(screen.getByText('Cerrar Sesión Usuario'));
    expect(screen.getByTestId('modal-confirmacion')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Confirmar Logout'));

    await waitFor(() => {
      expect(localStorage.getItem('jurassic_token')).toBeNull();
      expect(screen.getByTestId('auth-component')).toBeInTheDocument();
    });
  });

  it('Maneja error de token inválido redirigiendo al login', async () => {
    localStorage.setItem('jurassic_token', 'invalid-token');

    global.fetch = vi.fn((url) => {
        return Promise.resolve({
          ok: false,
          status: 401
        });
    });

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument());

    expect(localStorage.getItem('jurassic_token')).toBeNull();
    expect(screen.getByTestId('auth-component')).toBeInTheDocument();
  });
});