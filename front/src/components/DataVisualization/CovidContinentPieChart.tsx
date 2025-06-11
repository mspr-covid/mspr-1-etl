import React, { useMemo } from "react";
import { Pie } from "react-chartjs-2";
import { useTranslation } from "react-i18next";

import {
	Chart as ChartJS,
	ArcElement,
	Tooltip,
	Legend,
	Title,
	TooltipItem,
	ChartOptions,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface CovidDataPieChart {
	country: string;
	total_cases: number;
	continent: string;
}

interface CovidContinentPieChartProps {
	data: CovidDataPieChart[];
}

const CovidContinentPieChart: React.FC<CovidContinentPieChartProps> = ({
	data,
}) => {
	const { t } = useTranslation();

	const regionData = useMemo(() => {
		console.log("Continent PieChart - raw data:", data);

		const totals: Record<string, number> = {};

		data.forEach((entry) => {
			if (entry.continent && entry.total_cases > 0) {
				const continent = entry.continent.trim();
				totals[continent] = (totals[continent] || 0) + entry.total_cases;
			}
		});

		console.log("Continent PieChart - grouped totals:", totals);

		const continents = Object.keys(totals);
		const values = Object.values(totals);

		const backgroundColors = [
			"#3b82f6",
			"#10b981",
			"#f59e0b",
			"#ef4444",
			"#8b5cf6",
			"#ec4899",
			"#06b6d4",
			"#84cc16",
		];

		console.log("Continent PieChart - final continents:", continents);
		console.log("Continent PieChart - final values:", values);

		return {
			labels: continents,
			datasets: [
				{
					label: t("data_visualization.cases_by_region") || "Cases by Region",
					data: values,
					backgroundColor: backgroundColors.slice(0, continents.length),
					borderColor: "#ffffff",
					borderWidth: 2,
					hoverBorderWidth: 3,
					hoverBorderColor: "#ffffff",
				},
			],
		};
	}, [data, t]);

	const pieOptions: ChartOptions<"pie"> = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			title: {
				display: true,
				text:
					t("data_visualization.title_pie") || "COVID-19 Cases by Continent",
				font: {
					size: 16,
					weight: "bold" as const,
				},
				padding: 20,
			},
			tooltip: {
				backgroundColor: "rgba(15,23,42,0.9)",
				titleColor: "#f8fafc",
				bodyColor: "#f8fafc",
				borderColor: "#64748b",
				borderWidth: 1,
				callbacks: {
					label: (ctx: TooltipItem<"pie">) => {
						const label = ctx.label || "";
						const value = Number(ctx.raw) || 0;
						const total = ctx.dataset.data.reduce(
							(sum: number, val: number) => sum + Number(val),
							0
						);
						const percentage = ((value / total) * 100).toFixed(1);
						return `${label}: ${value.toLocaleString()} cas (${percentage}%)`;
					},
				},
			},
			legend: {
				position: "bottom" as const,
				labels: {
					padding: 20,
					usePointStyle: true,
					font: {
						size: 12,
					},
				},
			},
		},
		animation: {
			animateRotate: true,
			animateScale: true,
		},
	};

	const hasData = regionData.datasets[0].data.length > 0;

	return (
		<div className="card shadow-sm mt-3">
			<div className="card-body">
				<h5>
					{t("data_visualization.title_pie") || "COVID-19 Cases by Continent"}
				</h5>
				{hasData ? (
					<div style={{ height: 400 }}>
						<Pie data={regionData} options={pieOptions} />
					</div>
				) : (
					<div className="text-center text-muted py-5">
						<p>
							{t("data_visualization.pie_no_data") ||
								"No data available for this chart."}
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default CovidContinentPieChart;
