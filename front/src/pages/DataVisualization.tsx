import React, { useEffect, useState, useRef } from "react";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	PointElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js";
import { Bar, Scatter } from "react-chartjs-2";
import { getCountries } from "../services/api";
import { useTranslation } from "react-i18next";


ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	PointElement,
	Title,
	Tooltip,
	Legend
);

interface CovidData {
	country: string;
	total_cases: number;
	total_deaths: number;
	total_recovered: number;
	active_cases: number;
	serious_critical: number;
	total_tests: number;
	population: number;
}


const DataVisualization: React.FC = () => {
	const [data, setData] = useState<CovidData[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedCountries, setSelectedCountries] = useState<string[]>(["USA"]);
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const { t } = useTranslation();

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(e.target as Node)
			) {
				setDropdownOpen(false);
			}
		};
		document.addEventListener("click", handleClickOutside);
		return () => document.removeEventListener("click", handleClickOutside);
	}, []);

	const fetchData = async () => {
		try {
			setLoading(true);
			setError(null);
			const res = await getCountries();
			setData(res.data ?? []);
		} catch (err) {
			setError("Failed to fetch COVID-19 data.");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	const prepareBarChartData = () => {
		const sorted = [...data]
			.filter((c) => c.total_cases > 0)
			.sort((a, b) => b.total_cases - a.total_cases)
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

	const prepareScatterData = () => {
		const filtered = data.filter(
			(c) =>
				selectedCountries.includes(c.country) &&
				c.total_tests > 0 &&
				c.total_cases > 0
		);
		return {
			datasets: [
				{
					label: "Tests vs Cases",
					data: filtered.map((c) => ({
						x: c.total_tests,
						y: c.total_cases,
						label: c.country,
					})),
					backgroundColor: "rgba(16, 185, 129, 0.8)",
				},
			],
		};
	};

	const chartOptions = {
		indexAxis: "y" as const,
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: { display: false },
			tooltip: {
				backgroundColor: "rgba(15,23,42,0.9)",
				titleColor: "#f8fafc",
				bodyColor: "#f8fafc",
				callbacks: {
					label: (ctx: any) =>
						`${ctx.label || ""}: ${ctx.parsed.x?.toLocaleString() || ""} cases`,
				},
			},
		},
		scales: {
			x: {
				beginAtZero: true,
				ticks: { callback: (v: any) => v.toLocaleString() },
			},
			y: { ticks: { font: { size: 12 } } },
		},
	};

	const scatterOptions = {
		responsive: true,
		plugins: {
			title: {
				display: true,
				text: "Corrélation: Nombre de tests vs cas détectés",
			},
			tooltip: {
				callbacks: {
					label: (ctx: any) => {
						const { label, x, y } = ctx.raw;
						return `${label}: ${x.toLocaleString()} tests, ${y.toLocaleString()} cas`;
					},
				},
			},
		},
		scales: {
			x: {
				title: { display: true, text: "Nombre de tests" },
				ticks: { callback: (v: any) => v.toLocaleString() },
			},
			y: {
				title: { display: true, text: "Cas détectés" },
				ticks: { callback: (v: any) => v.toLocaleString() },
			},
		},
	};

	const toggleCountry = (country: string) => {
		setSelectedCountries((s) =>
			s.includes(country) ? s.filter((c) => c !== country) : [...s, country]
		);
	};
	const clearSelection = () => setSelectedCountries([]);

	if (loading)
		return (
			<div className="container py-5 text-center">
				<div className="spinner-border text-primary" role="status"></div>
				<p>Loading COVID‑19 data...</p>
			</div>
		);
	if (error)
		return (
			<div className="container py-5 text-center">
				<div className="alert alert-danger">{error}</div>
				<button className="btn btn-primary" onClick={fetchData}>
					Retry
				</button>
			</div>
		);

	return (
		<div className="container py-5">
			<div className="row mb-5">
				<div className="col-md-4 mb-3">
					<div className="card shadow-sm">
						<div className="card-body d-flex justify-content-between">
							<div>
								<small className="text-muted">{t("data_visualization.card_total_countries")}</small>
								<h4 className="mb-0">{data.length}</h4>
							</div>
							<span style={{ fontSize: "2rem" }}>🌍</span>
						</div>
					</div>
				</div>
				<div className="col-md-4 mb-3">
					<div className="card shadow-sm">
						<div className="card-body d-flex justify-content-between">
							<div>
								<small className="text-muted">{t("data_visualization.card_global_cases")}</small>
								<h4 className="mb-0">
									{data.reduce((s, c) => s + c.total_cases, 0).toLocaleString()}
								</h4>
							</div>
							<span style={{ fontSize: "2rem" }}>⚠️</span>
						</div>
					</div>
				</div>
				<div className="col-md-4 mb-3">
					<div className="card shadow-sm">
						<div className="card-body d-flex justify-content-between">
							<div>
								<small className="text-muted">{t("data_visualization.card_global_recovered")}</small>
								<h4 className="mb-0">
									{data
										.reduce((s, c) => s + c.total_recovered, 0)
										.toLocaleString()}
								</h4>
							</div>
							<span style={{ fontSize: "2rem" }}>♻️</span>
						</div>
					</div>
				</div>
			</div>

			<div className="card shadow-sm mb-4">
				<div className="card-body">
					<h5>{t("data_visualization.top_total_cases")}</h5>
					<div style={{ height: 300 }}>
						<Bar data={prepareBarChartData()} options={chartOptions} />
					</div>
				</div>
			</div>

			<div className="mb-3 position-relative" ref={dropdownRef}>
				<button
					className="btn btn-outline-primary"
					onClick={() => setDropdownOpen((o) => !o)}
				>
					{t("buttons.select_countries")} ({selectedCountries.length})
				</button>
				{dropdownOpen && (
					<div
						className="border bg-white position-absolute p-2"
						style={{
							maxHeight: 300,
							overflowY: "auto",
							zIndex: 100,
							minWidth: 250,
						}}
					>
						<button
							className="btn btn-sm btn-outline-secondary w-100"
							onClick={clearSelection}
						>
							Clear All
						</button>
						{data.map((c) => (
							<div key={c.country} className="form-check">
								<input
									type="checkbox"
									id={`chk-${c.country}`}
									checked={selectedCountries.includes(c.country)}
									onChange={() => toggleCountry(c.country)}
									className="form-check-input"
								/>
								<label
									htmlFor={`chk-${c.country}`}
									className="form-check-label"
								>
									{c.country}
								</label>
							</div>
						))}
						<hr />
					</div>
				)}
			</div>

			{/* → Scatter Plot */}
			<div className="card shadow-sm">
				<div className="card-body">
					<h5>Tests vs Cases Scatter Plot</h5>
					{selectedCountries.length > 0 ? (
						<div style={{ height: 300 }}>
							<Scatter data={prepareScatterData()} options={scatterOptions} />
						</div>
					) : (
						<p className="text-muted">
							{t("data_visualization.select_countries_hint")}
						</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default DataVisualization;
