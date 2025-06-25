import React from "react";
import { useTranslation } from "react-i18next";

const Footer: React.FC = () => {
	const { t } = useTranslation();

	return (
		<footer className="bg-light border-top py-4 mt-5">
			<div className="container">
				<div className="row gy-4">
					<div className="col-md-6">
						<h6 className="text-primary fw-bold mb-1">
							<i className="bi bi-heart-pulse-fill me-2"></i>
							Analyze IT — COVID-19 Research
						</h6>
						<p className="text-muted small mb-0">
							&copy; 2025 {t("covid.dashboard")} — {t("machine_learning.about")}
						</p>
						<small className="text-muted d-block">
							{t("machine_learning.about_date")}{" "}
							{new Date().toLocaleDateString("fr-FR")}
						</small>
					</div>

					<div className="col-md-6 text-md-end">
						<ul className="list-inline mb-0">
							<li className="list-inline-item me-3">
								<a
									href="https://www.kaggle.com/"
									target="_blank"
									rel="noopener noreferrer"
									className="text-decoration-none text-primary"
								>
									<i className="bi bi-box-arrow-up-right me-1"></i>
									Kaggle
								</a>
							</li>
							<li className="list-inline-item me-3">
								<a
									href="https://www.who.int/"
									target="_blank"
									rel="noopener noreferrer"
									className="text-decoration-none text-primary"
								>
									<i className="bi bi-globe2 me-1"></i>
									OMS
								</a>
							</li>
							<li className="list-inline-item me-3">
								<a
									href="https://github.com/mspr-covid/mspr-1-etl"
									target="_blank"
									rel="noopener noreferrer"
									className="text-decoration-none text-primary"
								>
									<i className="bi bi-github me-1"></i>
									GitHub Repo
								</a>
							</li>
							<li className="list-inline-item">
								<a
									href="https://covid-app.fly.dev/"
									target="_blank"
									rel="noopener noreferrer"
									className="text-decoration-none text-primary"
								>
									<i className="bi bi-server me-1"></i>
									API
								</a>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
