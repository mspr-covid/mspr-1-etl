"use client";

import type React from "react";
import { useEffect, useState } from "react";
import {
	getLearningCurves,
	getResidualPlots,
	getModelMetrics,
} from "../services/api";
import { useTranslation } from "react-i18next";
import PlotCards from "../components/MachineLearningVisualization/PlotCards";
import ImageModal from "../components/ImageModal";
import ModelComparisonChart from "../components/MachineLearningVisualization/ModelComparisonChart";

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

	const [visibleMetricsModelLearning, setVisibleMetricsModelLearning] =
		useState<string | null>(null);
	const [visibleMetricsModelResidual, setVisibleMetricsModelResidual] =
		useState<string | null>(null);

	// Je me suis basé sur l'index au départ pour trier les courbes par nom de modèle mais l'ordre n'était pas toujours cohérent.
	// J'ai donc créé une fonction pour extraire le nom du modèle à partir de l'URL.
	// Mais l'idéal serait d'ajouter une clé `modelName` dans les données renvoyées par l'API pour éviter de devoir parser les URLs.
	const extractModelNameFromUrl = (url: string): string => {
		const match = url.match(/(?:learning_curve_|residual_plot_)(.*)\.png$/);
		return match ? match[1] : url;
	};

	const fetchPlots = async () => {
		try {
			setLoading(true);
			setError(null);

			const [learning, residuals, metricsDataRaw] = await Promise.all([
				getLearningCurves(),
				getResidualPlots(),
				getModelMetrics(),
			]);

			setMetrics(metricsDataRaw.metrics ?? {});

			const sortByModelName = (urls: string[]) =>
				urls.sort((a, b) =>
					extractModelNameFromUrl(a).localeCompare(extractModelNameFromUrl(b))
				);

			setLearningPlots(sortByModelName(learning.plots ?? []));
			setResidualPlots(sortByModelName(residuals.plots ?? []));
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

	if (loading) {
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
	}

	if (error) {
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
	}

	const renderCard = (
		url: string,
		index: number,
		type: "learning" | "residual"
	) => {
		const modelName = extractModelNameFromUrl(url);
		const title =
			type === "learning"
				? `${t("machine_learning.plot_title")} ${index + 1}`
				: `${t("machine_learning.residual_plot_information")} ${index + 1}`;

		const isLearning = type === "learning";
		const visibleModel = isLearning
			? visibleMetricsModelLearning
			: visibleMetricsModelResidual;
		const setVisibleModel = isLearning
			? setVisibleMetricsModelLearning
			: setVisibleMetricsModelResidual;

		const isVisible = visibleModel === modelName;

		const onToggleVisible = () => {
			setVisibleModel(visibleModel === modelName ? null : modelName);
		};

		return (
			<PlotCards
				key={index}
				url={url}
				index={index}
				type={type}
				title={title}
				modelName={modelName}
				metrics={metrics}
				isVisible={isVisible}
				onToggleVisible={onToggleVisible}
				onOpenImageModal={openImageModal}
			/>
		);
	};

	return (
		<div className="bg-light min-vh-100">
			{/* Header */}
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

			{/* Refresh button */}
			<div className="container mt-4 text-center">
				<button
					className="btn btn-primary me-3 px-4 py-2 rounded-pill fw-medium"
					onClick={fetchPlots}
				>
					<i className="bi bi-arrow-clockwise me-2"></i>
					{t("buttons.refresh")}
				</button>
			</div>

			{/* Plots */}
			<div className="container py-5">
				{/* Learning */}
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
							{learningPlots.map((url, index) =>
								renderCard(url, index, "learning")
							)}
						</div>
					) : (
						<div className="text-center py-5 text-muted">
							<i className="bi bi-graph-up fs-1 mb-3 d-block"></i>
							<p>{t("machine_learning.no_plot")}</p>
						</div>
					)}
				</div>

				{/* Residuals */}
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
							{residualPlots.map((url, index) =>
								renderCard(url, index, "residual")
							)}
						</div>
					) : (
						<div className="text-center py-5 text-muted">
							<i className="bi bi-scatter-chart fs-1 mb-3 d-block"></i>
							<p>{t("machine_learning.no_plot")}</p>
						</div>
					)}
				</div>

				<ModelComparisonChart
					metrics={metrics}
					title={t("machine_learning.title_model_comparison")}
				/>
			</div>

			{selectedImage && (
				<ImageModal
					url={selectedImage.url}
					title={selectedImage.title}
					onClose={closeImageModal}
				/>
			)}
		</div>
	);
};

export default PlotVisualization;
