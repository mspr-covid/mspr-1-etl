import React from "react";

type Props = {
	modelName: string;
	metrics: Record<string, number>;
};

const ModelMetricCard: React.FC<Props> = ({ modelName, metrics }) => {
	return (
		<div
			className="card border border-primary shadow-sm h-100 overflow-hidden"
			style={{ cursor: "default" }}
		>
			<div className="card-header bg-white border-0 py-3 d-flex align-items-center gap-2">
				<i className="bi bi-graph-up text-primary fs-5" aria-hidden="true"></i>
				<h6 className="card-title mb-0 text-primary fw-semibold flex-grow-1">
					{modelName}
				</h6>
			</div>
			<div className="card-body">
				<div className="row g-2">
					{Object.entries(metrics).map(([metricName, value]) => (
						<div key={metricName} className="col-12 col-md-6">
							<div className="border rounded px-3 py-2 bg-light d-flex justify-content-between align-items-center">
								<span className="fw-semibold text-primary text-capitalize">
									{metricName}
								</span>
								<span className="badge bg-primary bg-opacity-75 fs-6">
									{typeof value === "number" ? value.toFixed(2) : "N/A"}
								</span>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default ModelMetricCard;
