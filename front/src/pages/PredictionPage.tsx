import React, { useState } from "react";
import { getPredictionV2 } from "../services/api";
import { useTranslation } from "react-i18next";
import CountryInputPredict from "../types/CountryInputPredict";

function PredictionPage() {
	const [formData, setFormData] = useState<CountryInputPredict>({
		continent: "",
		who_region: "",
		country: "",
		population: 0,
		total_recovered: 0,
		active_cases: 0,
		serious_critical: 0,
		total_tests: 0,
		new_total_cases: 0,
	});

	const [predicting, setPredicting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [predictedDeaths, setPredictedDeaths] = useState<number | null>(null);
	const { t } = useTranslation();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validation
		if (!formData.country || !formData.continent || !formData.who_region) {
			setError("Veuillez remplir tous les champs obligatoires.");
			return;
		}

		if (
			formData.population <= 0 ||
			formData.new_total_cases < 0 ||
			formData.total_tests <= 0
		) {
			setError(
				"Veuillez entrer des valeurs valides pour tous les champs numériques."
			);
			return;
		}

		setPredicting(true);
		setError(null);
		setPredictedDeaths(null);

		try {
			const result = await getPredictionV2(formData);
			setPredictedDeaths(result.predicted_total_deaths);
		} catch (err) {
			setError("Erreur lors de la prédiction. Veuillez réessayer.");
			console.error(err);
		} finally {
			setPredicting(false);
		}
	};

	const handleInputChange = (
		field: keyof CountryInputPredict,
		value: string | number
	) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const continents = [
		"Africa",
		"Asia",
		"Europe",
		"North America",
		"South America",
		"Oceania",
		"Antarctica",
	];

	const whoRegions = [
		"Africa",
		"Americas",
		"EasternMediterranean",
		"Europe",
		"EastAsia",
		"WesternPacific",
	];

	return (
		<div className="min-vh-100 py-5">
			<div className="container">
				<div className="row justify-content-center">
					<div className="col-lg-10 col-xl-8">
						{/* Header */}
						<div className="text-center mb-5">
							<div className="hero-icon"></div>
							<h1 className="display-5 fw-bold text-dark mb-3">
								{t("predict.global_title")}
							</h1>
							<p className="lead text-muted">
								{t("predict.general_description")}
							</p>
						</div>

						{/* Error Alert */}
						{error && (
							<div
								className="alert alert-danger alert-dismissible fade show mb-4"
								role="alert"
							>
								<div className="d-flex align-items-center">
									<span className="me-2">⚠️</span>
									<div>
										<strong>Erreur :</strong> {error}
									</div>
								</div>
								<button
									type="button"
									className="btn-close"
									onClick={() => setError(null)}
									aria-label="Close"
								></button>
							</div>
						)}

						{/* Main Form Card */}
						<div className="card form-card mb-4">
							<div className="card-header">
								<h4 className="mb-0 text-center fw-bold">
									<span className="me-2 ">🌍</span>
									{t("predict.title_form")}
								</h4>
							</div>
							<div className="card-body p-4">
								<form onSubmit={handleSubmit}>
									{/* Section 1: Informations géographiques */}
									<div className="section-header mb-3">
										<h5 className="text-primary mb-3">
											<span className="me-2">📍</span>
											{t("predict.title_section_1")}
										</h5>
									</div>

									<div className="row mb-4">
										<div className="col-md-4 mb-3">
											<label htmlFor="country" className="form-label">
												<span className="me-2">🏳️</span>
												{t("country.name")} *
											</label>
											<input
												type="text"
												className="form-control"
												id="country"
												value={formData.country}
												onChange={(e) =>
													handleInputChange("country", e.target.value)
												}
												placeholder="Ex: France"
												required
											/>
										</div>

										<div className="col-md-4 mb-3">
											<label htmlFor="continent" className="form-label">
												<span className="me-2">🌍</span>
												{t("country.continent")} *
											</label>
											<select
												className="form-select"
												id="continent"
												value={formData.continent}
												onChange={(e) =>
													handleInputChange("continent", e.target.value)
												}
												required
											>
												<option value="">{t("predict.select_option_1")}</option>
												{continents.map((continent) => (
													<option key={continent} value={continent}>
														{continent}
													</option>
												))}
											</select>
										</div>

										<div className="col-md-4 mb-3">
											<label htmlFor="who_region" className="form-label">
												<span className="me-2">🏥</span>
												{t("country.who_region")} *
											</label>
											<select
												className="form-select"
												id="who_region"
												value={formData.who_region}
												onChange={(e) =>
													handleInputChange("who_region", e.target.value)
												}
												required
											>
												<option value="">{t("predict.select_option_2")}</option>
												{whoRegions.map((region) => (
													<option key={region} value={region}>
														{region}
													</option>
												))}
											</select>
										</div>
									</div>

									{/* Section 2: Données démographiques */}
									<div className="section-header mb-3">
										<h5 className="text-primary mb-3">
											<span className="me-2">👥</span>
											{t("predict.title_section_2")}
										</h5>
									</div>

									<div className="row mb-4">
										<div className="col-md-12 mb-3">
											<label htmlFor="population" className="form-label">
												<span className="me-2">👨‍👩‍👧‍👦</span>
												{t("country.population")} *
											</label>
											<div className="input-group">
												<span className="input-group-text">👥</span>
												<input
													type="number"
													className="form-control"
													id="population"
													value={formData.population || ""}
													onChange={(e) =>
														handleInputChange(
															"population",
															parseInt(e.target.value) || 0
														)
													}
													placeholder="Population du pays"
													required
													min="1"
												/>
											</div>
										</div>
									</div>

									{/* Section 3: Données COVID-19 */}
									<div className="section-header mb-3">
										<h5 className="text-primary mb-3">
											<span className="me-2 fs-1">🦠</span>
											{t("predict.title_section_3")}
										</h5>
									</div>

									<div className="row mb-4">
										<div className="col-md-6 mb-3">
											<label htmlFor="total_cases" className="form-label">
												<span className="me-2">📊</span>
												{t("country.cases")}
											</label>
											<div className="input-group">
												<span className="input-group-text">📈</span>
												<input
													type="number"
													className="form-control"
													id="total_cases"
													value={formData.new_total_cases || 0}
													onChange={(e) =>
														handleInputChange(
															"new_total_cases",
															parseInt(e.target.value) || 0
														)
													}
													placeholder="Nombre total de cas"
													min="0"
												/>
											</div>
										</div>
										{/* 
										<div className="col-md-6 mb-3">
											<label htmlFor="total_deaths" className="form-label">
												<span className="me-2">💀</span>
												{t("country.deaths")}
											</label>
											<div className="input-group">
												<span className="input-group-text">⚰️</span>
												<input
													type="number"
													className="form-control"
													id="total_deaths"
													value={formData.total_deaths || ""}
													onChange={(e) =>
														handleInputChange(
															"total_deaths",
															parseInt(e.target.value) || 0
														)
													}
													placeholder="Nombre total de décès"
													min="0"
												/>
											</div>
										</div> */}
									</div>

									<div className="row mb-4">
										<div className="col-md-4 mb-3">
											<label htmlFor="total_recovered" className="form-label">
												<span className="me-2">✅</span>
												{t("country.recovered")}
											</label>
											<div className="input-group">
												<span className="input-group-text">💚</span>
												<input
													type="number"
													className="form-control"
													id="total_recovered"
													value={formData.total_recovered || ""}
													onChange={(e) =>
														handleInputChange(
															"total_recovered",
															parseInt(e.target.value) || 0
														)
													}
													placeholder="Nombre de guéris"
													min="0"
												/>
											</div>
										</div>

										<div className="col-md-4 mb-3">
											<label htmlFor="serious_critical" className="form-label">
												<span className="me-2">🚨</span>
												{t("country.critical")} *
											</label>
											<div className="input-group">
												<span className="input-group-text">🏥</span>
												<input
													type="number"
													className="form-control"
													id="serious_critical"
													value={formData.serious_critical || ""}
													onChange={(e) =>
														handleInputChange(
															"serious_critical",
															parseInt(e.target.value) || 0
														)
													}
													placeholder="Cas critiques"
													min="0"
												/>
											</div>
										</div>

										<div className="col-md-4 mb-3">
											<label htmlFor="total_tests" className="form-label">
												<span className="me-2">🧪</span>
												{t("country.total_tests")} *
											</label>
											<div className="input-group">
												<span className="input-group-text">🔬</span>
												<input
													type="number"
													className="form-control"
													id="total_tests"
													value={formData.total_tests || ""}
													onChange={(e) =>
														handleInputChange(
															"total_tests",
															parseInt(e.target.value) || 0
														)
													}
													placeholder="Nombre total de tests"
													required
													min="1"
												/>
											</div>
										</div>
									</div>

									<div className="d-grid">
										<button
											type="submit"
											className="btn btn-primary btn-lg"
											disabled={predicting}
										>
											{predicting ? (
												<>
													<span
														className="spinner-border spinner-border-sm me-2"
														role="status"
														aria-hidden="true"
													></span>
													Prédiction en cours...
												</>
											) : (
												<>
													<span className="me-2">🎯</span>
													{t("predict.submit")}
												</>
											)}
										</button>
									</div>
								</form>
							</div>
						</div>

						{/* Results Card */}
						{predictedDeaths !== null && (
							<div className="card result-card">
								<div className="card-body text-center p-4">
									<h5 className="card-title mb-3">
										<span className="me-2">📊</span>
										Résultat de la prédiction
									</h5>
									<div className="prediction-number mb-2">
										{predictedDeaths.toLocaleString("fr-FR")}
									</div>
									<p className="text-muted mb-0">décès prédits</p>
									<small className="text-muted d-block mt-2">
										* Prédiction basée sur un modèle d'intelligence artificielle
										avancé
									</small>
								</div>
							</div>
						)}

						{/* Info Card */}
						<div className="card mt-4 border-0 bg-light">
							<div className="card-body">
								<h6 className="card-title">
									<span className="me-2">ℹ️</span>
									{t("predict.about_title")}
								</h6>
								<p className="card-text small text-muted mb-0">
									{t("predict.about")}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default PredictionPage;
