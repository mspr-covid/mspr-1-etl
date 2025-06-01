import React, { useState, useEffect } from "react";
import {
	Table,
	Form,
	InputGroup,
	Button,
	Alert,
	Card,
	Spinner,
} from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { getCountries } from "../services/api";

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
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const { t } = useTranslation();

	useEffect(() => {
		const fetchCountries = async () => {
			try {
				setLoading(true);
				const data = await getCountries();

				console.log("Réponse brute API getCountries:", data);

				if (data && Array.isArray(data.data)) {
					setCountries(data.data);
					setFilteredCountries(data.data);
					setError(null);
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

	return (
		<div>
			<h2 className="mb-4">{t("countries.title")}</h2>

			<Card className="mb-4">
				<Card.Body>
					<Form>
						<InputGroup>
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
			) : error ? (
				<Alert variant="danger">{error}</Alert>
			) : filteredCountries.length === 0 ? (
				<Alert variant="info">{t("countries.noResults")}</Alert>
			) : (
				<div className="table-responsive">
					<Table striped hover className="table-hover">
						<thead>
							<tr>
								<th>{t("country.name")}</th>
								<th>{t("country.continent")}</th>
								<th>{t("country.who_region")}</th>
								<th>{t("country.population")}</th>
								<th>{t("country.cases")}</th>
								<th>{t("country.deaths")}</th>
								<th>{t("country.recovered")}</th>
								<th>{t("country.critical")}</th>
								<th>{t("country.total_tests")}</th>
							</tr>
						</thead>
						<tbody>
							{filteredCountries.map((country) => (
								<tr key={country.country}>
									<td>{country.country}</td>
									<td>{country.continent}</td>
									<td>{country.who_region}</td>
									<td>{country.population.toLocaleString()}</td>
									<td>{country.total_cases.toLocaleString()}</td>
									<td>{country.total_deaths.toLocaleString()}</td>
									<td>{country.total_recovered.toLocaleString()}</td>
									<td>{country.serious_critical.toLocaleString()}</td>
									<td>{country.total_tests.toLocaleString()}</td>
								</tr>
							))}
						</tbody>
					</Table>
				</div>
			)}
		</div>
	);
};

export default CountriesPage;
