import React from "react";
import { useTranslation } from "react-i18next";

const Footer: React.FC = () => {
	const { t } = useTranslation();

	return (
		<footer className="bg-white border-top py-4 mt-5">
			<div className="container">
				<div className="row align-items-center">
					<div className="col-md-6">
						<p className="text-muted mb-0">
							&copy; 2025 {t("covid.dashboard")}
						</p>
					</div>

					<div className="col-md-6 text-md-end">
						<p className="text-muted mb-0">
							<i className="bi bi-shield-check me-2 text-primary"></i>
							{t("machine_learning.about")}
						</p>
						<small className="text-muted">
							{t("machine_learning.about_date")}{" "}
							{new Date().toLocaleDateString("fr-FR")}
						</small>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
