import { useState, useEffect } from "react";
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
	Badge,
} from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { getCountries, deleteCountry } from "../services/api";
import ConfirmModal from "../components/ConfirmModal";
import { continentClassMap } from "./styles/continentTag";
import CountryCard from "../components/CountryCard";
import AddCountryModal from "../components/AddCountryModal";

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
	death_rate?: number;
	recovery_rate?: number;
}

type SortKey = keyof Country | "death_rate" | "recovery_rate";
type SortOrder = "asc" | "desc";

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
	const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
	const [sortKey, setSortKey] = useState<SortKey>("country");
	const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
	const [showAddModal, setShowAddModal] = useState(false);
	const { t } = useTranslation();

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 768);
		};
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const calculateRates = (data: Country[]): Country[] => {
		return data.map((country) => {
			const deathRate =
				country.total_cases > 0
					? (country.total_deaths / country.total_cases) * 100
					: 0;
			const recoveryRate =
				country.total_cases > 0
					? (country.total_recovered / country.total_cases) * 100
					: 0;
			return {
				...country,
				death_rate: deathRate,
				recovery_rate: recoveryRate,
			};
		});
	};

	const fetchCountries = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await getCountries();

			if (data && Array.isArray(data.data)) {
				const countriesWithRates = calculateRates(data.data);
				setCountries(countriesWithRates);
				setFilteredCountries(countriesWithRates);
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
		const filtered = searchTerm.trim()
			? countries.filter(
					(country) =>
						country.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
						country.continent
							.toLowerCase()
							.includes(searchTerm.toLowerCase()) ||
						country.who_region.toLowerCase().includes(searchTerm.toLowerCase())
			  )
			: [...countries];

		filtered.sort((a, b) => {
			const aValue = a[sortKey] ?? 0;
			const bValue = b[sortKey] ?? 0;
			if (typeof aValue === "string" && typeof bValue === "string") {
				return sortOrder === "asc"
					? aValue.localeCompare(bValue)
					: bValue.localeCompare(aValue);
			}
			return sortOrder === "asc"
				? Number(aValue) - Number(bValue)
				: Number(bValue) - Number(aValue);
		});

		setFilteredCountries(filtered);
	}, [searchTerm, countries, sortKey, sortOrder]);

	const toggleSort = (key: SortKey) => {
		if (sortKey === key) {
			setSortOrder(sortOrder === "asc" ? "desc" : "asc");
		} else {
			setSortKey(key);
			setSortOrder("asc");
		}
	};

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

			const updatedCountries = countries.filter(
				(c) => c.country !== countryToDelete
			);
			setCountries(updatedCountries);

			setSuccessMessage(
				t("countries.deleteSuccess", { country: countryToDelete })
			);
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

	const sortIcon = (key: SortKey) => {
		if (sortKey !== key) return <i className="bi bi-arrow-down-up ms-1" />;
		return sortOrder === "asc" ? (
			<i className="bi bi-arrow-up" />
		) : (
			<i className="bi bi-arrow-down" />
		);
	};

	return (
		<Container fluid className="py-4">
			<Row>
				<Col>
					<div className="d-flex justify-content-between align-items-center mb-4">
						<h2 className="mb-0">{t("countries.title")}</h2>
						<Badge bg="primary" className="fs-6">
							{filteredCountries.length === 1
								? `${t("countries.total_countries")} : ${
										filteredCountries.length
								  }`
								: `${t("countries.total_countries_plural")} : ${
										filteredCountries.length
								  }`}
						</Badge>
					</div>

					{successMessage && (
						<Alert
							variant="success"
							dismissible
							onClose={() => setSuccessMessage(null)}
						>
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
									<InputGroup.Text>🔍</InputGroup.Text>
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
											X
										</Button>
									)}
									<Button
										variant="success"
										onClick={() => setShowAddModal(true)}
									>
										{t("buttons.add_country")}
									</Button>
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
					) : isMobile ? (
						<div>
							{filteredCountries.map((country) => (
								<CountryCard
									key={country.country}
									country={country}
									handleDeleteClick={handleDeleteClick}
									deleting={deleting}
								/>
							))}
						</div>
					) : (
						<div className="table-responsive rounded-3">
							<Table striped hover className="table-hover responsive-table">
								<thead className="table-dark">
									<tr>
										<th onClick={() => toggleSort("country")}>
											<div
												className="d-flex flex-column justify-content-center align-items-center"
												style={{ cursor: "pointer" }}
											>
												{t("country.name")} {sortIcon("country")}
											</div>
										</th>
										<th onClick={() => toggleSort("continent")}>
											<div
												className="d-flex flex-column justify-content-center align-items-center"
												style={{ cursor: "pointer" }}
											>
												{t("country.continent")} {sortIcon("continent")}
											</div>
										</th>
										<th onClick={() => toggleSort("who_region")}>
											<div
												className="d-flex flex-column justify-content-center align-items-center"
												style={{ cursor: "pointer" }}
											>
												{t("country.who_region")} {sortIcon("who_region")}
											</div>
										</th>
										<th onClick={() => toggleSort("population")}>
											<div
												className="d-flex flex-column justify-content-center align-items-center"
												style={{ cursor: "pointer" }}
											>
												{t("country.population")} {sortIcon("population")}
											</div>
										</th>
										<th onClick={() => toggleSort("total_cases")}>
											<div
												className="d-flex flex-column justify-content-center align-items-center"
												style={{ cursor: "pointer" }}
											>
												{t("country.cases")} {sortIcon("total_cases")}
											</div>
										</th>
										<th onClick={() => toggleSort("total_deaths")}>
											<div
												className="d-flex flex-column justify-content-center align-items-center"
												style={{ cursor: "pointer" }}
											>
												{t("country.deaths")} {sortIcon("total_deaths")}
											</div>
										</th>
										<th onClick={() => toggleSort("total_recovered")}>
											<div
												className="d-flex flex-column justify-content-center align-items-center"
												style={{ cursor: "pointer" }}
											>
												{t("country.recovered")} {sortIcon("total_recovered")}
											</div>
										</th>
										<th onClick={() => toggleSort("serious_critical")}>
											<div
												className="d-flex flex-column justify-content-center align-items-center"
												style={{ cursor: "pointer" }}
											>
												{t("country.critical")} {sortIcon("serious_critical")}
											</div>
										</th>
										<th onClick={() => toggleSort("total_tests")}>
											<div
												className="d-flex flex-column justify-content-center align-items-center"
												style={{ cursor: "pointer" }}
											>
												{t("country.total_tests")} {sortIcon("total_tests")}
											</div>
										</th>
										<th className="text-center">
											<div className="d-flex flex-column justify-content-center align-items-center">
												{t("country.actions")}
											</div>
										</th>
									</tr>
								</thead>
								<tbody>
									{filteredCountries.map((country) => (
										<tr key={country.country}>
											<td>
												<strong>{country.country}</strong>
											</td>
											<td>
												<Badge
													bg="secondary"
													className={`text-white ${
														continentClassMap[country.continent] || ""
													}`}
												>
													{country.continent}
												</Badge>
											</td>
											<td>
												<small className="text-muted">
													{country.who_region}
												</small>
											</td>
											<td className="text-end">
												{country.population.toLocaleString()}
											</td>
											<td className="text-end text-primary fw-bold">
												{country.total_cases.toLocaleString()}
											</td>
											<td className="text-end text-danger fw-bold">
												{country.total_deaths.toLocaleString()}
												<br />
												<small className="text-muted">
													({country.death_rate?.toFixed(2)}%)
												</small>
											</td>
											<td className="text-end text-success fw-bold">
												{country.total_recovered.toLocaleString()}
												<br />
												<small className="text-muted">
													({country.recovery_rate?.toFixed(2)}%)
												</small>
											</td>
											<td className="text-end text-warning fw-bold">
												{country.serious_critical.toLocaleString()}
											</td>
											<td className="text-end">
												{country.total_tests.toLocaleString()}
											</td>
											<td className="text-center">
												<Button
													variant="outline-danger"
													size="sm"
													onClick={() => handleDeleteClick(country.country)}
													disabled={deleting === country.country}
													className="d-flex align-items-center justify-content-center"
												>
													{deleting === country.country ? (
														<Spinner animation="border" size="sm" />
													) : (
														"🗑️"
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
				message={t("countries.confirmDeleteMessage", {
					country: countryToDelete,
				})}
				confirmText={t("countries.delete")}
				cancelText={t("countries.cancel")}
				onConfirm={handleDeleteConfirm}
				onCancel={handleDeleteCancel}
				variant="danger"
			/>
			<AddCountryModal
				show={showAddModal}
				onHide={() => setShowAddModal(false)}
			/>
		</Container>
	);
};

export default CountriesPage;
