import React, { useState } from "react";
import { Form, Button, Card, Alert, Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { createCountry } from "../services/api";
import CountryInput from "../types/CountryInput";

const AddCountryForm = () => {
	const { t } = useTranslation();

	const [formData, setFormData] = useState<CountryInput>({
		country: "",
		continent: "",
		who_region: "",
		population: 0,
		total_cases: 0,
		total_deaths: 0,
		total_recovered: 0,
		serious_critical: 0,
		total_tests: 0,
	});

	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		const numericFields = [
			"population",
			"total_cases",
			"total_deaths",
			"total_recovered",
			"serious_critical",
			"total_tests",
		];
		setFormData({
			...formData,
			[name]: numericFields.includes(name) ? Number(value) : value,
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		setError(null);
		setSuccess(null);

		try {
			await createCountry(formData);
			setSuccess(t("manage.success"));
			setFormData({
				country: "",
				continent: "",
				who_region: "",
				population: 0,
				total_cases: 0,
				total_deaths: 0,
				total_recovered: 0,
				serious_critical: 0,
				total_tests: 0,
			});
		} catch (err) {
			setError(t("manage.error"));
			console.error("Error creating country:", err);
		} finally {
			setSaving(false);
		}
	};

	return (
		<Card className="mx-auto" style={{ maxWidth: "600px" }}>
			<Card.Header>{t("manage.add")}</Card.Header>
			<Card.Body>
				{success && (
					<Alert
						variant="success"
						className="position-fixed bottom-0 end-0 mb-3 me-3"
						style={{ zIndex: 1050, minWidth: "300px" }}
					>
						{success}
					</Alert>
				)}

				{error && (
					<Alert
						variant="danger"
						className="position-fixed bottom-0 end-0 mb-3 me-3"
						style={{ zIndex: 1050, minWidth: "300px" }}
					>
						{error}
					</Alert>
				)}

				<Form onSubmit={handleSubmit}>
					<Form.Group className="mb-3">
						<Form.Label>{t("country.name")}</Form.Label>
						<Form.Control
							type="text"
							name="country"
							value={formData.country}
							onChange={handleChange}
							required
						/>
					</Form.Group>

					<Form.Group className="mb-3">
						<Form.Label>{t("country.continent")}</Form.Label>
						<Form.Control
							type="text"
							name="continent"
							value={formData.continent}
							onChange={handleChange}
							required
						/>
					</Form.Group>

					<Form.Group className="mb-3">
						<Form.Label>{t("country.who_region")}</Form.Label>
						<Form.Control
							type="text"
							name="who_region"
							value={formData.who_region}
							onChange={handleChange}
							required
						/>
					</Form.Group>

					<Form.Group className="mb-3">
						<Form.Label>{t("country.population")}</Form.Label>
						<Form.Control
							type="number"
							name="population"
							value={formData.population}
							onChange={handleChange}
							min={0}
							required
						/>
					</Form.Group>

					<Form.Group className="mb-3">
						<Form.Label>{t("country.cases")}</Form.Label>
						<Form.Control
							type="number"
							name="total_cases"
							value={formData.total_cases}
							onChange={handleChange}
							min={0}
							required
						/>
					</Form.Group>

					<Form.Group className="mb-3">
						<Form.Label>{t("country.deaths")}</Form.Label>
						<Form.Control
							type="number"
							name="total_deaths"
							value={formData.total_deaths}
							onChange={handleChange}
							min={0}
							required
						/>
					</Form.Group>

					<Form.Group className="mb-3">
						<Form.Label>{t("country.recovered")}</Form.Label>
						<Form.Control
							type="number"
							name="total_recovered"
							value={formData.total_recovered}
							onChange={handleChange}
							min={0}
							required
						/>
					</Form.Group>

					<Form.Group className="mb-3">
						<Form.Label>{t("country.critical")}</Form.Label>
						<Form.Control
							type="number"
							name="serious_critical"
							value={formData.serious_critical}
							onChange={handleChange}
							min={0}
							required
						/>
					</Form.Group>

					<Form.Group className="mb-3">
						<Form.Label>{t("country.total_tests")}</Form.Label>
						<Form.Control
							type="number"
							name="total_tests"
							value={formData.total_tests}
							onChange={handleChange}
							min={0}
							required
						/>
					</Form.Group>

					<div className="d-flex justify-content-end">
						<Button variant="primary" type="submit" disabled={saving}>
							{saving ? (
								<>
									<Spinner
										as="span"
										animation="border"
										size="sm"
										role="status"
										aria-hidden="true"
										className="me-2"
									/>
									{t("app.loading")}
								</>
							) : (
								t("manage.add")
							)}
						</Button>
					</div>
				</Form>
			</Card.Body>
		</Card>
	);
};

export default AddCountryForm;
