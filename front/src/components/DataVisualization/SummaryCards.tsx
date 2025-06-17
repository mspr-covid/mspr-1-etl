import React from "react";
import { useTranslation } from "react-i18next";

interface CovidData {
	total_cases: number;
	total_recovered: number;
}

interface SummaryCardsProps {
	data: CovidData[];
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ data }) => {
	const { t } = useTranslation();

	return (
		<div className="row mb-5">
			<div className="col-md-4 mb-3">
				<div className="card shadow-sm">
					<div className="card-body d-flex justify-content-between">
						<div>
							<small className="text-muted">
								{t("data_visualization.card_total_countries")}
							</small>
							<h4 className="mb-0">{data.length}</h4>
						</div>
						<span style={{ fontSize: "2rem" }}>
							<img src="./icons/globe.svg" alt="" />
						</span>
					</div>
				</div>
			</div>
			<div className="col-md-4 mb-3">
				<div className="card shadow-sm">
					<div className="card-body d-flex justify-content-between p-2">
						<div>
							<small className="text-muted">
								{t("data_visualization.card_global_cases")}
							</small>
							<h4 className="mb-0">
								{data.reduce((s, c) => s + c.total_cases, 0).toLocaleString()}
							</h4>
						</div>
						<span className="fs-1">🦠</span>
					</div>
				</div>
			</div>
			<div className="col-md-4 mb-3">
				<div className="card shadow-sm">
					<div className="card-body d-flex justify-content-between">
						<div>
							<small className="text-muted">
								{t("data_visualization.card_global_recovered")}
							</small>
							<h4 className="mb-0">
								{data
									.reduce((s, c) => s + c.total_recovered, 0)
									.toLocaleString()}
							</h4>
						</div>
						<span style={{ fontSize: "2rem" }}>
							<img
								src="./icons/syringe.svg"
								alt="syringe for total recovered"
							/>
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SummaryCards;
