import React, { useState } from 'react';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom'; // ✅ MODIF: import de useNavigate

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [validated, setValidated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, error } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate(); // ✅ MODIF: initialisation de useNavigate

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = e.currentTarget as HTMLFormElement;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setIsLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card>
        <Card.Header as="h4" className="text-center">{t('auth.login')}</Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formUsername">
              <Form.Label>{t('auth.username')}</Form.Label>
              <Form.Control
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t('auth.username')}
              />
              <Form.Control.Feedback type="invalid">
                {t('auth.required')}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4" controlId="formPassword">
              <Form.Label>{t('auth.password')}</Form.Label>
              <Form.Control
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.password')}
              />
              <Form.Control.Feedback type="invalid">
                {t('auth.required')}
              </Form.Control.Feedback>
            </Form.Group>

            <div className="d-grid">
              <Button
                variant="primary"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? t('app.loading') : t('auth.login')}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default LoginPage;
