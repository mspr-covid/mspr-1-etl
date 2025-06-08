import React, { useState, useEffect } from "react";
import {
	Table,
	Form,
	InputGroup,
	Button,
	Alert,
	Card,
	Spinner,
	Container,
	Row,
	Col,
	Badge
} from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { getCountries, deleteCountry } from "../services/api";
import ConfirmModal from "../components/ConfirmModal";
import { continentClassMap } from "./styles/continentTag";

interface Country {
	country: string;
	continent: string;
	who_region: string;
	population: number;
	total_cases: number;
	total_deaths: number;
	total_recovered: number;
	serious_critical: number;
	total_tests: number;
}

const CountriesPage = () => {
	const [countries, setCountries] = useState<Country[]>([]);
	const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
	const [loading, setLoading] = useState(true);
	const [deleting, setDeleting] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [countryToDelete, setCountryToDelete] = useState<string>("");
	const { t } = useTranslation();

	const fetchCountries = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await getCountries();


			if (data && Array.isArray(data.data)) {
				setCountries(data.data);
				setFilteredCountries(data.data);
			} else {
				setError(t("countries.error") + " (La réponse ne contient pas data)");
				setCountries([]);
				setFilteredCountries([]);
			}
		} catch (err) {
			setError(t("countries.error"));
			console.error("Erreur lors du fetch des pays :", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchCountries();
	}, [t]);

	useEffect(() => {
		if (searchTerm.trim() === "") {
			setFilteredCountries(countries);
		} else {
			const filtered = countries.filter(
				(country) =>
					country.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
					country.continent.toLowerCase().includes(searchTerm.toLowerCase()) ||
					country.who_region.toLowerCase().includes(searchTerm.toLowerCase())
			);
			setFilteredCountries(filtered);
		}
	}, [searchTerm, countries]);

	const handleDeleteClick = (countryName: string) => {
		setCountryToDelete(countryName);
		setShowConfirmModal(true);
	};

	const handleDeleteConfirm = async () => {
		try {
			setDeleting(countryToDelete);
			setError(null);
			setSuccessMessage(null);
			setShowConfirmModal(false);

			await deleteCountry(countryToDelete);

			// Remove from local state
			const updatedCountries = countries.filter(c => c.country !== countryToDelete);
			setCountries(updatedCountries);
			setFilteredCountries(updatedCountries.filter(
				(country) =>
					country.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
					country.continent.toLowerCase().includes(searchTerm.toLowerCase()) ||
					country.who_region.toLowerCase().includes(searchTerm.toLowerCase())
			));

			setSuccessMessage(t("countries.deleteSuccess"));
			
			// Clear success message after 3 seconds
			setTimeout(() => setSuccessMessage(null), 3000);
		} catch (err) {
			setError(t("countries.deleteError"));
			console.error("Error deleting country:", err);
		} finally {
			setDeleting(null);
			setCountryToDelete("");
		}
	};

	const handleDeleteCancel = () => {
		setShowConfirmModal(false);
		setCountryToDelete("");
	};

	const formatNumber = (num: number) => {
		return num.toLocaleString();
	};

	const getDeathRate = (deaths: number, cases: number) => {
		return cases > 0 ? ((deaths / cases) * 100).toFixed(2) + '%' : '0%';
	};

	const getRecoveryRate = (recovered: number, cases: number) => {
		return cases > 0 ? ((recovered / cases) * 100).toFixed(2) + '%' : '0%';
	};

	return (
		<Container fluid className="py-4">
			<Row>
				<Col>
					<div className="d-flex justify-content-between align-items-center mb-4">
						<h2 className="mb-0">{t("countries.title")}</h2>
						<Badge bg="primary" className="fs-6">
							{filteredCountries.length === 1
								? `${t("countries.total_countries")} : ${filteredCountries.length}`
								: `${t("countries.total_countries_plural")} : ${filteredCountries.length}`}
						</Badge>

					</div>

					{successMessage && (
						<Alert variant="success" dismissible onClose={() => setSuccessMessage(null)}>
							{successMessage}
						</Alert>
					)}

					{error && (
						<Alert variant="danger" dismissible onClose={() => setError(null)}>
							{error}
						</Alert>
					)}

					<Card className="mb-4">
						<Card.Body>
							<Form>
								<InputGroup>
									<InputGroup.Text>
										🔍
									</InputGroup.Text>
									<Form.Control
										placeholder={t("countries.search")}
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
									/>
									{searchTerm && (
										<Button
											variant="outline-secondary"
											onClick={() => setSearchTerm("")}
										>
											✕
										</Button>
									)}
								</InputGroup>
							</Form>
						</Card.Body>
					</Card>

					{loading ? (
						<div className="text-center my-5">
							<Spinner animation="border" role="status" />
							<p className="mt-2">{t("countries.loading")}</p>
						</div>
					) : filteredCountries.length === 0 ? (
						<Alert variant="info">{t("countries.noResults")}</Alert>
					) : (
						<div className="table-responsive">
							<Table striped hover className="table-hover">
								<thead className="table-dark">
									<tr>
										<th>{t("country.name")}</th>
										<th>{t("country.continent")}</th>
										<th>{t("country.who_region")}</th>
										<th className="text-end">{t("country.population")}</th>
										<th className="text-end">{t("country.cases")}</th>
										<th className="text-end">{t("country.deaths")}</th>
										<th className="text-end">{t("country.recovered")}</th>
										<th className="text-end">{t("country.critical")}</th>
										<th className="text-end">{t("country.total_tests")}</th>
										<th className="text-center">{t("country.actions")}</th>
									</tr>
								</thead>
								<tbody>
									{filteredCountries.map((country) => (
										<tr key={country.country}>
											<td>
												<strong>{country.country}</strong>
											</td>
											<td>
											<Badge bg="secondary" className={`text-white ${continentClassMap[country.continent] || ""}`}>
  												{country.continent}
											</Badge>

											</td>
											<td>
												<small className="text-muted">{country.who_region}</small>
											</td>
											<td className="text-end">{formatNumber(country.population)}</td>
											<td className="text-end">
												<span className="fw-bold text-primary">
													{formatNumber(country.total_cases)}
												</span>
											</td>
											<td className="text-end">
												<span className="fw-bold text-danger">
													{formatNumber(country.total_deaths)}
												</span>
												<br />
												<small className="text-muted">
													{getDeathRate(country.total_deaths, country.total_cases)}
												</small>
											</td>
											<td className="text-end">
												<span className="fw-bold text-success">
													{formatNumber(country.total_recovered)}
												</span>
												<br />
												<small className="text-muted">
													{getRecoveryRate(country.total_recovered, country.total_cases)}
												</small>
											</td>
											<td className="text-end">
												<span className="fw-bold text-warning">
													{formatNumber(country.serious_critical)}
												</span>
											</td>
											<td className="text-end">{formatNumber(country.total_tests)}</td>
											<td className="text-center">
												<Button
													variant="outline-danger"
													size="sm"
													onClick={() => handleDeleteClick(country.country)}
													disabled={deleting === country.country}
													className="d-flex align-items-center justify-content-center"
												>
													{deleting === country.country ? (
														<Spinner animation="border\" size="sm" />
													) : (
														'🗑️'
													)}
												</Button>
											</td>
										</tr>
									))}
								</tbody>
							</Table>
						</div>
					)}
				</Col>
			</Row>

			<ConfirmModal
				show={showConfirmModal}
				title={t("countries.confirmDelete")}
				message={t("countries.confirmDeleteMessage", { country: countryToDelete })}
				confirmText={t("countries.delete")}
				cancelText={t("countries.cancel")}
				onConfirm={handleDeleteConfirm}
				onCancel={handleDeleteCancel}
				variant="danger"
			/>
		</Container>
	);
};

export default CountriesPage;