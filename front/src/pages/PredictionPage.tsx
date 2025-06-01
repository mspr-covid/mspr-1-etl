import React, { useState } from "react";
import { Form, Button, Card, Alert, Spinner } from "react-bootstrap";
import { getPrediction } from "../services/api";
import { useTranslation } from "react-i18next";


const PredictionPage = () => {
	const { t } = useTranslation();
	const [totalRecovered, setTotalRecovered] = useState<number | "">("");
	const [seriousCritical, setSeriousCritical] = useState<number | "">("");
	const [totalTests, setTotalTests] = useState<number | "">("");
	const [predicting, setPredicting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [predictedDeaths, setPredictedDeaths] = useState<number | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (totalRecovered === "" || seriousCritical === "" || totalTests === "") {
			setError("Veuillez remplir tous les champs.");
			return;
		}

		setPredicting(true);
		setError(null);
		setPredictedDeaths(null);

		try {
			const data = {
				total_recovered: Number(totalRecovered),
				serious_critical: Number(seriousCritical),
				total_tests: Number(totalTests),
			};

			const result = await getPrediction(data);

			setPredictedDeaths(result.predicted_total_deaths);
		} catch (err) {
			setError("Erreur lors de la prédiction.");
			console.error(err);
		} finally {
			setPredicting(false);
		}
	};

	return (
		<div className="form-container">
			<h2>{t("predict.title")}</h2>
			<p>
				{t("predict.description")}
			</p>

			{error && (
				<Alert variant="danger" onClose={() => setError(null)} dismissible>
					{error}
				</Alert>
			)}

			<Card>
				<Card.Body>
					<Form onSubmit={handleSubmit}>
						<Form.Group className="mb-3">
							<Form.Label>{t("country.recovered")}</Form.Label>
							<Form.Control
								type="number"
								value={totalRecovered}
								onChange={(e) =>
									setTotalRecovered(
										e.target.value === "" ? "" : Number(e.target.value)
									)
								}
								required
							/>
						</Form.Group>

						<Form.Group className="mb-3">
							<Form.Label>{t("country.critical")}</Form.Label>
							<Form.Control
								type="number"
								value={seriousCritical}
								onChange={(e) =>
									setSeriousCritical(
										e.target.value === "" ? "" : Number(e.target.value)
									)
								}
								required
							/>
						</Form.Group>

						<Form.Group className="mb-3">
							<Form.Label>{t("country.total_tests")}</Form.Label>
							<Form.Control
								type="number"
								value={totalTests}
								onChange={(e) =>
									setTotalTests(
										e.target.value === "" ? "" : Number(e.target.value)
									)
								}
								required
							/>
						</Form.Group>

						<Button type="submit" disabled={predicting}>
							{predicting ? (
								<>
									<Spinner animation="border" size="sm" /> Prédiction en
									cours...
								</>
							) : (
								"Prédire"
							)}
						</Button>
					</Form>
				</Card.Body>
			</Card>

			{predictedDeaths !== null && (
				<Card className="mt-3 border-primary">
					<Card.Body>
						<h5>Décès prédits : {predictedDeaths.toLocaleString()}</h5>
					</Card.Body>
				</Card>
			)}
		</div>
	);
};

export default PredictionPage;
