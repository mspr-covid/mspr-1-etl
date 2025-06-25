"use client";

import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import {
	Chart as ChartJS,
	BarElement,
	CategoryScale,
	LinearScale,
	Tooltip,
	Legend,
	ChartOptions,
	TooltipItem,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

type Props = {
	metrics: Record<string, Record<string, number>>;
	availableMetrics?: string[];
	title?: string;
};

const ModelComparisonChart: React.FC<Props> = ({
	metrics,
	availableMetrics,
	title,
}) => {
	const modelNames = Object.keys(metrics);
	const metricKeys =
		availableMetrics ?? Object.keys(metrics[modelNames[0]] || {});
	const [selectedMetric, setSelectedMetric] = useState<string>(
		metricKeys[0] || ""
	);

	const values = modelNames.map(
		(model) => metrics[model]?.[selectedMetric] ?? 0
	);

	const data = {
		labels: modelNames,
		datasets: [
			{
				label: selectedMetric.toUpperCase(),
				data: values,
				backgroundColor: "rgba(54, 162, 235, 0.6)",
				borderColor: "rgba(54, 162, 235, 1)",
				borderWidth: 1,
			},
		],
	};

	const options: ChartOptions<"bar"> = {
		responsive: true,
		plugins: {
			legend: { display: false },
			tooltip: {
				callbacks: {
					label: (context: TooltipItem<"bar">) => {
						const value = context.parsed.y;
						return `${context.dataset.label}: ${value.toFixed(2)}`;
					},
				},
			},
		},
		scales: {
			y: {
				beginAtZero: true,
			},
		},
	};

	return (
		<div className="card shadow-sm border-0 my-4">
			<div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
				<h5 className="mb-0 text-primary fw-bold">
					<i className="bi bi-bar-chart-fill me-2"></i>
					{title || "Comparaison des modèles"}
				</h5>
				{metricKeys.length > 1 && (
					<select
						className="form-select w-auto"
						value={selectedMetric}
						onChange={(e) => setSelectedMetric(e.target.value)}
					>
						{metricKeys.map((key) => (
							<option key={key} value={key}>
								{key.toUpperCase()}
							</option>
						))}
					</select>
				)}
			</div>
			<div className="card-body">
				<Bar data={data} options={options} />
			</div>
		</div>
	);
};

export default ModelComparisonChart;
