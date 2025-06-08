import React from "react";
import { useTranslation } from "react-i18next";

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

interface CountryCardProps {
	country: Country;
	deleting?: string | null;
	handleDeleteClick: (countryName: string) => void;
}

const getContinentColor = (continent: string) => {
	const colors: Record<string, string> = {
		Asia: "bg-blue-100 text-blue-800 border-blue-200",
		Europe: "bg-green-100 text-green-800 border-green-200",
		Africa: "bg-yellow-100 text-yellow-800 border-yellow-200",
		"North America": "bg-purple-100 text-purple-800 border-purple-200",
		"South America": "bg-red-100 text-red-800 border-red-200",
		Oceania: "bg-indigo-100 text-indigo-800 border-indigo-200",
	};
	return colors[continent] || "bg-gray-100 text-gray-800 border-gray-200";
};

const formatNumber = (num: number) => {
	return num.toLocaleString();
};

const getDeathRate = (deaths: number, cases: number) => {
	return cases > 0 ? ((deaths / cases) * 100).toFixed(2) + "%" : "0%";
};

const getRecoveryRate = (recovered: number, cases: number) => {
	return cases > 0 ? ((recovered / cases) * 100).toFixed(2) + "%" : "0%";
};

const CountryCard: React.FC<CountryCardProps> = ({
	country,
	deleting,
	handleDeleteClick,
}) => {
	const { t } = useTranslation();

	return (
		<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200 my-5">
			<div className="flex justify-between items-start mb-3">
				<div>
					<h3 className="font-semibold text-lg text-gray-900">
						{country.country}
					</h3>
					<span
						className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getContinentColor(
							country.continent
						)}`}
					>
						{country.continent}
					</span>
				</div>
				<button
					onClick={() => handleDeleteClick(country.country)}
					disabled={deleting === country.country}
					className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors duration-200"
				>
					{deleting === country.country ? (
						<div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
					) : (
						<span className="text-lg">🗑️</span>
					)}
				</button>
			</div>

			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<span className="text-gray-500">👥</span>
						<span className="text-sm text-gray-600">
							{t("country.population")}
						</span>
					</div>
					<span className="font-medium text-gray-900">
						{formatNumber(country.population)}
					</span>
				</div>

				<div className="grid grid-cols-2 gap-3">
					<div className="bg-blue-50 rounded-lg p-3">
						<div className="flex items-center space-x-2 mb-1">
							<span className="text-blue-600">📈</span>
							<span className="text-xs font-medium text-blue-600">
								{t("country.total_tests")}
							</span>
						</div>
						<div className="font-bold text-blue-900">
							{formatNumber(country.total_tests)}
						</div>
					</div>

					<div className="bg-red-50 rounded-lg p-3">
						<div className="flex items-center space-x-2 mb-1">
							<span className="text-red-600">📉</span>
							<span className="text-xs font-medium text-red-600">
								{t("country.deaths")}
							</span>
						</div>
						<div className="font-bold text-red-900">
							{formatNumber(country.total_deaths)}
						</div>
						<div className="text-xs text-red-600">
							{getDeathRate(country.total_deaths, country.total_tests)}
						</div>
					</div>

					<div className="bg-green-50 rounded-lg p-3">
						<div className="flex items-center space-x-2 mb-1">
							<span className="text-green-600">🛡️</span>
							<span className="text-xs font-medium text-green-600">
								{t("country.recovered")}
							</span>
						</div>
						<div className="font-bold text-green-900">
							{formatNumber(country.total_recovered)}
						</div>
						<div className="text-xs text-green-600">
							{getRecoveryRate(country.total_recovered, country.total_cases)}
						</div>
					</div>

					<div className="bg-orange-50 rounded-lg p-3">
						<div className="flex items-center space-x-2 mb-1">
							<span className="text-orange-600">⚠️</span>
							<span className="text-xs font-medium text-orange-600">
								{t("country.critical")}
							</span>
						</div>
						<div className="font-bold text-orange-900">
							{formatNumber(country.serious_critical)}
						</div>
					</div>
				</div>

				<div className="flex items-center justify-between pt-2 border-t border-gray-100">
					<div className="flex items-center space-x-2">
						<span className="text-gray-500">🧪</span>
						<span className="text-sm text-gray-600">
							{t("country.total_tests")}
						</span>
					</div>
					<span className="font-medium text-gray-900">
						{formatNumber(country.total_tests)}
					</span>
				</div>
			</div>
		</div>
	);
};

export default CountryCard;
