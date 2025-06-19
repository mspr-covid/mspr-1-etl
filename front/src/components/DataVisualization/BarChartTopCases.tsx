import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Bar } from "react-chartjs-2";

import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
	ChartOptions,
	TooltipItem,
} from "chart.js";

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend
);

interface CovidData {
	country: string;
	total_cases: number;
}

interface BarChartTopCasesProps {
	data: CovidData[];
}

const BarChartTopCases: React.FC<BarChartTopCasesProps> = ({ data }) => {
	const { t } = useTranslation();

	const [showTopHigh, setShowTopHigh] = useState(true);

	const prepareBarChartData = () => {
		const sorted = [...data]
			.filter((c) => c.total_cases > 0)
			.sort((a, b) =>
				showTopHigh
					? b.total_cases - a.total_cases
					: a.total_cases - b.total_cases
			)
			.slice(0, 15);

		return {
			labels: sorted.map((c) => c.country),
			datasets: [
				{
					label: "Total Cases",
					data: sorted.map((c) => c.total_cases),
					backgroundColor: "rgba(59, 130, 246, 0.8)",
					borderColor: "rgba(59, 130, 246, 1)",
					borderWidth: 1,
					borderRadius: 4,
					borderSkipped: false,
				},
			],
		};
	};

	const chartOptions: ChartOptions<"bar"> = {
		indexAxis: "y",
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: { display: false },
			tooltip: {
				backgroundColor: "rgba(15,23,42,0.9)",
				titleColor: "#f8fafc",
				bodyColor: "#f8fafc",
				callbacks: {
					label: (ctx: TooltipItem<"bar">) =>
						`${ctx.label || ""}: ${ctx.parsed.x?.toLocaleString() || ""} cases`,
				},
			},
		},
		scales: {
			x: {
				beginAtZero: true,
				ticks: {
					callback: (v: number | string) =>
						typeof v === "number" ? v.toLocaleString() : v,
				},
			},
			y: { ticks: { font: { size: 12 } } },
		},
	};

	return (
		<div className="card shadow-sm mb-4">
			<div className="card-body">
				<div className="d-flex justify-content-between align-items-center mb-3">
					<h5>
						{showTopHigh
							? t("data_visualization.top_total_cases")
							: t("data_visualization.lowest_total_cases")}
					</h5>
					<button
						className="btn btn-outline-primary"
						onClick={() => setShowTopHigh(!showTopHigh)}
					>
						{showTopHigh
							? t("buttons.show_lowest_cases")
							: t("buttons.show_highest_cases")}
					</button>
				</div>
				<div style={{ height: 300 }}>
					<Bar data={prepareBarChartData()} options={chartOptions} />
				</div>
			</div>
		</div>
	);
};

export default BarChartTopCases;
