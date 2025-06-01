import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { getCountries, getPrediction } from '../services/api';

interface Country {
  id: string;
  name: string;
}

interface PredictionResult {
  prediction: number;
  confidence: number;
  message: string;
}

const PredictionPage = () => {
  const { t } = useTranslation();
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        const data = await getCountries();
        setCountries(data);
        if (data.length > 0) {
          setSelectedCountry(data[0].id);
        }
      } catch (err) {
        setError(t('countries.error'));
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();

    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDate(tomorrow.toISOString().split('T')[0]);
  }, [t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCountry || !date) return;
    
    setPredicting(true);
    setError(null);
    setPredictionResult(null);
    
    try {
      const result = await getPrediction({
        country_id: selectedCountry,
        prediction_date: date
      });
      
      setPredictionResult(result);
    } catch (err) {
      setError(t('predict.error'));
      console.error('Prediction error:', err);
    } finally {
      setPredicting(false);
    }
  };

  return (
    <div className="form-container">
      <h2 className="mb-4">{t('predict.title')}</h2>
      
      <p className="lead mb-4">{t('predict.description')}</p>
      
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>{t('predict.country')}</Form.Label>
              <Form.Select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                disabled={loading || countries.length === 0}
                required
              >
                {loading ? (
                  <option>{t('app.loading')}</option>
                ) : countries.length === 0 ? (
                  <option>{t('countries.noResults')}</option>
                ) : (
                  countries.map((country) => (
                    <option key={country.id} value={country.id}>
                      {country.name}
                    </option>
                  ))
                )}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>{t('predict.date')}</Form.Label>
              <Form.Control
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </Form.Group>

            <div className="d-grid">
              <Button
                type="submit"
                variant="primary"
                disabled={loading || predicting || !selectedCountry || !date}
              >
                {predicting ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    {t('predict.loading')}
                  </>
                ) : (
                  t('predict.submit')
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {predictionResult && (
        <Card className="border-primary">
          <Card.Header className="bg-primary text-white">
            <h5 className="mb-0">{t('predict.result')}</h5>
          </Card.Header>
          <Card.Body>
            <div className="row">
              <div className="col-md-6">
                <h6>{t('country.cases')}:</h6>
                <p className="h3 mb-3">{predictionResult.prediction.toLocaleString()}</p>
              </div>
              <div className="col-md-6">
                <h6>Confidence:</h6>
                <p className="h3 mb-3">{(predictionResult.confidence * 100).toFixed(1)}%</p>
              </div>
            </div>
            {predictionResult.message && (
              <Alert variant="info" className="mb-0">
                {predictionResult.message}
              </Alert>
            )}
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default PredictionPage;