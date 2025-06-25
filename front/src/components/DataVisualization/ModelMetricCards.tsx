import React from "react";

type Props = {
	modelName: string;
	metrics: Record<string, number>;
};

const ModelMetricCard: React.FC<Props> = ({ modelName, metrics }) => {
	return (
		<div className="card border-0 shadow-sm h-100 overflow-hidden">
			<div className="card-header bg-white border-0 py-3">
				<h6 className="card-title mb-0 text-primary fw-semibold">
					{modelName}
				</h6>
			</div>
			<div className="card-body">
				{Object.entries(metrics).map(([metricName, value]) => (
					<div key={metricName} className="mb-2">
						<span className="fw-semibold text-capitalize">{metricName}:</span>{" "}
						<span className="text-muted">
							{typeof value === "number" ? value.toFixed(2) : "N/A"}
						</span>
					</div>
				))}
			</div>
		</div>
	);
};

export default ModelMetricCard;
