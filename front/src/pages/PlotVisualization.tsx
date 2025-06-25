"use client";

import type React from "react";
import { useEffect, useState } from "react";
import {
	getLearningCurves,
	getResidualPlots,
	getModelMetrics,
	API_URL,
} from "../services/api";
import { useTranslation } from "react-i18next";
import ModelMetricCard from "../components/DataVisualization/ModelMetricCards";

const PlotVisualization: React.FC = () => {
	const [learningPlots, setLearningPlots] = useState<string[]>([]);
	const [residualPlots, setResidualPlots] = useState<string[]>([]);
	const [metrics, setMetrics] = useState<
		Record<string, Record<string, number>>
	>({});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { t } = useTranslation();
	const [selectedImage, setSelectedImage] = useState<{
		url: string;
		title: string;
	} | null>(null);

	const [visibleMetricsModel, setVisibleMetricsModel] = useState<string | null>(
		null
	);

	const fetchPlots = async () => {
		try {
			setLoading(true);
			setError(null);

			const [learning, residuals, metricsDataRaw] = await Promise.all([
				getLearningCurves(),
				getResidualPlots(),
				getModelMetrics(),
			]);

			setLearningPlots(learning.plots ?? []);
			setResidualPlots(residuals.plots ?? []);
			setMetrics(metricsDataRaw.metrics ?? {});
		} catch (err) {
			setError("Failed to fetch plot images.");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const openImageModal = (url: string, title: string) => {
		setSelectedImage({ url, title });
	};

	const closeImageModal = () => {
		setSelectedImage(null);
	};

	useEffect(() => {
		fetchPlots();
	}, []);

	if (loading)
		return (
			<div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
				<div className="text-center">
					<div
						className="spinner-border text-primary mb-3"
						role="status"
						style={{ width: "3rem", height: "3rem" }}
					>
						<span className="visually-hidden">{t("app.loading")}</span>
					</div>
					<h5 className="text-primary fw-normal">{t("app.loading")}</h5>
					<p className="text-muted">{t("machine_learning.analyze")}</p>
				</div>
			</div>
		);

	if (error)
		return (
			<div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
				<div className="text-center">
					<div
						className="bg-white p-5 rounded-4 shadow-sm border-0"
						style={{ maxWidth: "400px" }}
					>
						<div className="text-danger mb-3">
							<i className="bi bi-exclamation-triangle-fill fs-1"></i>
						</div>
						<h5 className="text-dark mb-3">{t("app.error")}</h5>
						<p className="text-muted mb-4">{error}</p>
						<button
							className="btn btn-primary px-4 py-2 rounded-pill fw-medium"
							onClick={fetchPlots}
						>
							<i className="bi bi-arrow-clockwise me-2"></i>
							{t("app.retry")}
						</button>
					</div>
				</div>
			</div>
		);

	return (
		<div className="bg-light min-vh-100">
			{/* Header Section */}
			<div className="bg-primary text-white py-2 rounded-3">
				<div className="container">
					<div className="row align-items-center">
						<div className="col-lg-8">
							<h1 className="fw-bold mb-3">
								<i className="bi bi-graph-up me-3"></i>
								{t("machine_learning.global_title")}
							</h1>
							<p className="lead mb-0 opacity-90">
								{t("machine_learning.global_description")}
							</p>
						</div>
						<div className="col-lg-4 text-lg-end">
							<div className="bg-white bg-opacity-10 rounded-3 p-3 d-inline-block">
								<i className="bi bi-activity fs-1"></i>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Action Button */}
			<div className="container mt-4">
				<div className="text-center">
					<button
						className="btn btn-primary me-3 px-4 py-2 rounded-pill fw-medium"
						onClick={fetchPlots}
					>
						<i className="bi bi-arrow-clockwise me-2"></i>
						{t("buttons.refresh")}
					</button>
				</div>
			</div>

			<div className="container py-5">
				{/* Learning Curves Section */}
				<div className="mb-5">
					<div className="d-flex align-items-center mb-4">
						<div className="bg-primary rounded-circle p-3 me-3">
							<i className="bi bi-graph-up text-white fs-5"></i>
						</div>
						<div>
							<h2 className="mb-1 text-dark fw-bold">
								{t("machine_learning.learning_curve_title")}
							</h2>
							<p className="text-muted mb-0">
								{t("machine_learning.learning_curve_description")}
							</p>
						</div>
					</div>

					{learningPlots.length > 0 ? (
						<div className="row g-4">
							{learningPlots.map((url, index) => {
								const modelName = Object.keys(metrics)[index];
								return (
									<div key={index} className="col-lg-6">
										<div className="card border-0 shadow-sm h-100 overflow-hidden">
											<div className="card-header bg-white border-0 py-3">
												<h6 className="card-title mb-0 text-primary fw-semibold">
													<i className="bi bi-bar-chart me-2"></i>
													{t("machine_learning.plot_title")} {index + 1}
												</h6>
											</div>
											<div className="position-relative">
												<img
													src={`${API_URL}${url}`}
													alt={`Learning Curve ${index + 1}`}
													className="card-img-top"
													style={{ height: "300px", objectFit: "contain" }}
												/>
												<div className="position-absolute top-0 end-0 m-3 d-flex flex-column align-items-end">
													<button
														className="btn btn-sm btn-outline-primary rounded-pill mb-2"
														onClick={() =>
															openImageModal(
																`${API_URL}${url}`,
																t("machine_learning.plot_title")
															)
														}
													>
														<i className="bi bi-arrows-fullscreen"></i>
													</button>

													<button
														className="btn btn-sm btn-outline-primary rounded-pill mb-2"
														onClick={() =>
															setVisibleMetricsModel(
																visibleMetricsModel === modelName
																	? null
																	: modelName
															)
														}
														aria-label={
															visibleMetricsModel === modelName
																? "Hide metrics"
																: "Show metrics"
														}
														type="button"
													>
														<i className="bi bi-info-circle-fill"></i>
													</button>
												</div>
											</div>
											{visibleMetricsModel === modelName &&
												metrics[modelName] && (
													<div className="p-3">
														<ModelMetricCard
															modelName={modelName}
															metrics={metrics[modelName]}
														/>
													</div>
												)}
										</div>
									</div>
								);
							})}
						</div>
					) : (
						<div className="text-center py-5">
							<div className="text-muted">
								<i className="bi bi-graph-up fs-1 mb-3 d-block"></i>
								<p>{t("machine_learning.no_plot")}</p>
							</div>
						</div>
					)}
				</div>

				{/* Residual Plots Section */}
				<div>
					<div className="d-flex align-items-center mb-4">
						<div className="bg-primary rounded-circle p-3 me-3">
							<i className="bi bi-scatter-chart text-white fs-5"></i>
						</div>
						<div>
							<h2 className="mb-1 text-dark fw-bold">
								{t("machine_learning.residual_plot_title")}
							</h2>
							<p className="text-muted mb-0">
								{t("machine_learning.residual_plot_description")}
							</p>
						</div>
					</div>

					{residualPlots.length > 0 ? (
						<div className="row g-4">
							{residualPlots.map((url, index) => {
								const modelName = Object.keys(metrics)[index];
								return (
									<div key={index} className="col-lg-6">
										<div className="card border-0 shadow-sm h-100 overflow-hidden">
											<div className="card-header bg-white border-0 py-3">
												<h6 className="card-title mb-0 text-primary fw-semibold">
													<i className="bi bi-scatter-chart me-2"></i>
													{t("machine_learning.residual_plot_information")}{" "}
													{index + 1}
												</h6>
											</div>
											<div className="position-relative">
												<img
													src={`${API_URL}${url}`}
													alt={`Residual Plot ${index + 1}`}
													className="card-img-top"
													style={{ height: "300px", objectFit: "contain" }}
												/>
												<div className="position-absolute top-0 end-0 m-3 d-flex flex-column align-items-end">
													<button
														className="btn btn-sm btn-outline-primary rounded-pill mb-2"
														onClick={() =>
															openImageModal(
																`${API_URL}${url}`,
																`Graphique des résidus - Modèle ${index + 1}`
															)
														}
													>
														<i className="bi bi-arrows-fullscreen"></i>
													</button>

													<button
														className="btn btn-sm btn-outline-primary rounded-pill mb-2"
														onClick={() =>
															setVisibleMetricsModel(
																visibleMetricsModel === modelName
																	? null
																	: modelName
															)
														}
														aria-label={
															visibleMetricsModel === modelName
																? "Hide metrics"
																: "Show metrics"
														}
														type="button"
													>
														<i className="bi bi-info-circle-fill"></i>
													</button>
												</div>
											</div>
											{visibleMetricsModel === modelName &&
												metrics[modelName] && (
													<div className="p-3">
														<ModelMetricCard
															modelName={modelName}
															metrics={metrics[modelName]}
														/>
													</div>
												)}
										</div>
									</div>
								);
							})}
						</div>
					) : (
						<div className="text-center py-5">
							<div className="text-muted">
								<i className="bi bi-scatter-chart fs-1 mb-3 d-block"></i>
								<p>{t("machine_learning.no_plot")}</p>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Modal pour agrandir les images */}
			{selectedImage && (
				<div
					className="modal fade show d-block"
					tabIndex={-1}
					style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
				>
					<div className="modal-dialog modal-xl modal-dialog-centered">
						<div className="modal-content">
							<div className="modal-header border-0">
								<h5 className="modal-title text-primary fw-semibold">
									<i className="bi bi-graph-up me-2"></i>
									{selectedImage.title}
								</h5>
								<button
									type="button"
									className="btn-close"
									onClick={closeImageModal}
									aria-label="Close"
								></button>
							</div>
							<div className="modal-body p-0">
								<img
									src={selectedImage.url || "/placeholder.svg"}
									alt={selectedImage.title}
									className="img-fluid w-100"
									style={{ maxHeight: "80vh", objectFit: "contain" }}
								/>
							</div>
							<div className="modal-footer border-0 justify-content-center">
								<button
									type="button"
									className="btn btn-outline-primary rounded-pill px-4"
									onClick={closeImageModal}
								>
									<i className="bi bi-x-lg me-2"></i>
									{t("buttons.close")}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Footer */}
			<div className="bg-white border-top py-4 mt-5">
				<div className="container">
					<div className="row align-items-center">
						<div className="col-md-6">
							<p className="text-muted mb-0">
								<i className="bi bi-shield-check me-2 text-primary"></i>
								{t("machine_learning.about")}
							</p>
						</div>
						<div className="col-md-6 text-md-end">
							<small className="text-muted">
								{t("machine_learning.about_date")}{" "}
								{new Date().toLocaleDateString("fr-FR")}
							</small>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PlotVisualization;
