// __tests__/LoginPage.test.tsx

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../pages/LoginPage';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// --- Mocks ---
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) =>
      ({
        'auth.username': 'Username',
        'auth.password': 'Password',
        'auth.login': 'Login',
        'auth.required': 'Required',
        'app.loading': 'Loading',
      }[key] ?? key),
  }),
}));
jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('LoginPage — tests robustes', () => {
  const mockLogin = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // par défaut : pas d’erreur, login simulé
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      error: null,
    });
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  it('affiche les champs et le bouton activé au départ', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: /Login/i });
    expect(btn).toBeInTheDocument();
    expect(btn).toBeEnabled();
  });

  it('affiche deux messages "Required" si soumis sans rien remplir', async () => {
    render(<LoginPage />);
    const btn = screen.getByRole('button', { name: /Login/i });
    await userEvent.click(btn);

    const errors = await screen.findAllByText(/Required/i);
    expect(errors).toHaveLength(2);
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('désactive le bouton, appelle login et redirige sur succès', async () => {
    mockLogin.mockResolvedValueOnce(undefined);
    render(<LoginPage />);
    const user = userEvent.setup();

    const inputUser = screen.getByLabelText(/Username/i);
    const inputPass = screen.getByLabelText(/Password/i);
    const btn = screen.getByRole('button', { name: /Login/i });

    await user.type(inputUser, 'user1');
    await user.type(inputPass, 'secret');
    await user.click(btn);

    // loading
    expect(btn).toBeDisabled();
    expect(btn).toHaveTextContent(/Loading/i);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('user1', 'secret');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    // bouton redevient actif
    expect(screen.getByRole('button', { name: /Login/i })).toBeEnabled();
  });

  it('réactive le bouton et n’appelle pas navigate si login échoue', async () => {
    mockLogin.mockRejectedValueOnce(new Error('fail'));
    render(<LoginPage />);
    const user = userEvent.setup();

    const inputUser = screen.getByLabelText(/Username/i);
    const inputPass = screen.getByLabelText(/Password/i);
    const btn = screen.getByRole('button', { name: /Login/i });

    await user.type(inputUser, 'user1');
    await user.type(inputPass, 'secret');
    await user.click(btn);

    // login a été appelé
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('user1', 'secret');
    });
    // pas de redirection
    expect(mockNavigate).not.toHaveBeenCalled();
    // bouton réactivé
    expect(screen.getByRole('button', { name: /Login/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /Login/i })).toHaveTextContent(/Login/i);
  });

  it('affiche un alert si useAuth.error est renseigné', () => {
    (useAuth as jest.Mock).mockReturnValueOnce({
      login: mockLogin,
      error: 'Invalid credentials',
    });
    render(<LoginPage />);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Invalid credentials');
  });
});
