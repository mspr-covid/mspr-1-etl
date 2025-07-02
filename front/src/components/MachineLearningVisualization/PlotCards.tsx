"use client";

import React from "react";
import ModelMetricCard from "./ModelMetricCards";
import { API_URL } from "../../services/api";

type PlotCardProps = {
	url: string;
	index: number;
	type: "learning" | "residual";
	title: string;
	modelName: string;
	metrics: Record<string, Record<string, number>>;
	isVisible: boolean;
	onToggleVisible: () => void;
	onOpenImageModal: (url: string, title: string) => void;
};

const PlotCard: React.FC<PlotCardProps> = ({
	url,
	index,
	type,
	title,
	modelName,
	metrics,
	isVisible,
	onToggleVisible,
	onOpenImageModal,
}) => {
	const icon = type === "learning" ? "bi-bar-chart" : "bi-scatter-chart";
	const showToggleButton = type === "learning";

	return (
		<div className="col-lg-6">
			<div className="card border-0 shadow-sm h-100 overflow-hidden">
				<div className="card-header bg-white border-0 py-3">
					<h6 className="card-title mb-0 text-primary fw-semibold">
						<i className={`bi ${icon} me-2`}></i>
						{title}
					</h6>
				</div>
				<div className="position-relative">
					<img
						src={`${API_URL}${url}`}
						alt={`${type} plot ${index + 1}`}
						className="card-img-top mt-3"
						style={{ height: "300px", objectFit: "contain" }}
					/>
					<div className="position-absolute top-0 end-0 me-2 me-md-5 d-flex flex-column align-items-end">
						<button
							className="btn btn-sm btn-outline-primary rounded-pill mb-2"
							onClick={() => onOpenImageModal(`${API_URL}${url}`, title)}
						>
							<i className="bi bi-arrows-fullscreen"></i>
						</button>
						{showToggleButton && (
							<button
								className="btn btn-sm btn-outline-primary rounded-pill mb-2"
								onClick={onToggleVisible}
								aria-label={isVisible ? "Hide metrics" : "Show metrics"}
								type="button"
							>
								<i className="bi bi-info-circle-fill"></i>
							</button>
						)}
					</div>
				</div>
				{isVisible && metrics[modelName] && (
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
};

export default PlotCard;
