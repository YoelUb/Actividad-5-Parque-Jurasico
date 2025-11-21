import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Autenticacion from './Auth';

// Mock de useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Componente Autenticacion (Auth)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Renderiza el formulario de login correctamente', () => {
    render(
      <MemoryRouter>
        <Autenticacion enLoginExitoso={() => {}} />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText(/usuario \(email\)/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar al parque/i })).toBeInTheDocument();
  });

  it('Permite escribir en los inputs', () => {
    render(
      <MemoryRouter>
        <Autenticacion enLoginExitoso={() => {}} />
      </MemoryRouter>
    );

    const userInput = screen.getByPlaceholderText(/usuario \(email\)/i);
    const passInput = screen.getByPlaceholderText(/contraseña/i);

    fireEvent.change(userInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passInput, { target: { value: 'password123' } });

    expect(userInput.value).toBe('test@test.com');
    expect(passInput.value).toBe('password123');
  });

  it('Alterna la visibilidad de la contraseña al hacer clic en el ojo', () => {
    render(
      <MemoryRouter>
        <Autenticacion enLoginExitoso={() => {}} />
      </MemoryRouter>
    );

    const passInput = screen.getByPlaceholderText(/contraseña/i);
    const toggleButton = screen.getByRole('button', { name: /mostrar contraseña/i });

    expect(passInput).toHaveAttribute('type', 'password');

    fireEvent.click(toggleButton);
    expect(passInput).toHaveAttribute('type', 'text');

    fireEvent.click(toggleButton);
    expect(passInput).toHaveAttribute('type', 'password');
  });

  it('Maneja el login exitoso llamando a enLoginExitoso', async () => {
    const mockLoginExitoso = vi.fn();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: 'fake-jwt-token', must_change_password: false }),
    });

    render(
      <MemoryRouter>
        <Autenticacion enLoginExitoso={mockLoginExitoso} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/usuario/i), { target: { value: 'admin' } });
    fireEvent.change(screen.getByPlaceholderText(/contraseña/i), { target: { value: '1234' } });

    fireEvent.click(screen.getByRole('button', { name: /entrar al parque/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    expect(mockLoginExitoso).toHaveBeenCalledWith('fake-jwt-token');
  });

  it('Muestra error si la API falla', async () => {
    // Simulamos error 401
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: 'Credenciales inválidas' }),
    });

    render(
      <MemoryRouter>
        <Autenticacion enLoginExitoso={() => {}} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/usuario/i), { target: { value: 'errorUser' } });
    fireEvent.change(screen.getByPlaceholderText(/contraseña/i), { target: { value: 'errorPass' } });

    fireEvent.click(screen.getByRole('button', { name: /entrar al parque/i }));

    await waitFor(() => {
      expect(screen.getByText(/credenciales inválidas/i)).toBeInTheDocument();
    });
  });
});