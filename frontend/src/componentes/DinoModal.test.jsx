import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import DinoModal from './DinoModal';

vi.mock('./SpriteAnimator', () => ({
  default: ({ basePath, frameCount, startFrame }) => (
    <div data-testid="sprite-animator-mock">
      Animación: {basePath} (Frames: {frameCount}, Start: {startFrame})
    </div>
  ),
}));

describe('Componente DinoModal', () => {
  // Datos de prueba de un dinosaurio
  const mockDino = {
    nombre: 'T-Rex',
    especie: 'Tyrannosaurus Rex',
    dieta: 'Carnívoro',
    habitat: 'Jungla',
    descripcion: 'El rey de los dinosaurios.',
    sprite_base_path: '/assets/trex',
    animations: {
      idle: [1, 5],
      walk: [6, 10]
    }
  };

  it('No renderiza nada si la prop "dino" es null', () => {
    const { container } = render(<DinoModal dino={null} onClose={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('Renderiza la información del dinosaurio correctamente', () => {
    render(<DinoModal dino={mockDino} onClose={() => {}} />);

    expect(screen.getByText('T-Rex')).toBeInTheDocument();
    expect(screen.getByText(/Tyrannosaurus Rex/i)).toBeInTheDocument();
    expect(screen.getByText(/Carnívoro/i)).toBeInTheDocument();
    expect(screen.getByText(/Jungla/i)).toBeInTheDocument();
    expect(screen.getByText(/El rey de los dinosaurios/i)).toBeInTheDocument();
  });

  it('Muestra el animador con la animación "idle" por defecto', () => {
    render(<DinoModal dino={mockDino} onClose={() => {}} />);

    const animator = screen.getByTestId('sprite-animator-mock');
    expect(animator).toBeInTheDocument();
    // idle es [1, 5], frameCount = 5 - 1 + 1 = 5
    expect(animator).toHaveTextContent('Frames: 5');
  });

  it('Cambia la animación al hacer clic en "Caminar" (para dinos terrestres)', () => {
    render(<DinoModal dino={mockDino} onClose={() => {}} />);

    const botonCaminar = screen.getByRole('button', { name: /caminar/i });
    fireEvent.click(botonCaminar);

    expect(screen.getByTestId('sprite-animator-mock')).toHaveTextContent('Start: 6');
  });

  it('Llama a onClose cuando se hace clic en el botón de cerrar', () => {
    const handleClose = vi.fn();
    render(<DinoModal dino={mockDino} onClose={handleClose} />);

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('Muestra mensaje informativo para dinosaurios no terrestres (ej. Pteranodon)', () => {
    const voladorDino = {
      ...mockDino,
      nombre: 'Pteranodon',
      dieta: 'Carnívoro',
    };

    render(<DinoModal dino={voladorDino} onClose={() => {}} />);

    expect(screen.queryByText(/caminar/i)).not.toBeInTheDocument();

    expect(screen.getByText(/Este animal muestra su comportamiento natural/i)).toBeInTheDocument();
  });
});