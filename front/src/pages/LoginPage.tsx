import React, { useState } from "react";
import {
	Form,
	Button,
	Alert,
	Card,
	Container,
	Row,
	Col,
} from "react-bootstrap";
import { useTranslation, Trans } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [validated, setValidated] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const { login, error } = useAuth();
	const { t } = useTranslation();
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const form = e.currentTarget as HTMLFormElement;
		if (form.checkValidity() === false) {
			e.stopPropagation();
			setValidated(true);
			return;
		}

		setIsLoading(true);
		try {
			await login(username, password);
			navigate("/");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Container className="py-5">
			<Row className="justify-content-center mb-5">
				<Col md={10}>
					<Card className="shadow border-0">
						<Card.Body className="p-4">
							<div className="d-flex align-items-center mb-3">
								<div
									className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3"
									style={{ width: "48px", height: "48px" }}
								>
									<i className="bi bi-heart-pulse-fill fs-4"></i>
								</div>
								<div>
									<h1 className="mb-1 text-primary fw-bold">
										{t("homepage.global_title")}
									</h1>
									<p className="text-muted mb-0">
										{t("homepage.global_description")}
									</p>
								</div>
							</div>
							<p className="text-secondary mb-4">
								<Trans
									i18nKey="homepage.long_description"
									components={{
										strong: <strong />,
										kaggle: (
											<a
												href="https://www.kaggle.com/datasets/josephassaker/covid19-global-dataset/data"
												target="_blank"
												rel="noopener noreferrer"
												className="text-primary text-decoration-underline"
											/>
										),
									}}
								/>
							</p>

							<h2 className="text-primary fw-semibold mb-2">
								<i className="bi bi-diagram-3-fill me-2"></i>
								{t("homepage.section1_title")}
							</h2>
							<p className="text-secondary mb-3">
								<Trans
									i18nKey="homepage.section1_description"
									components={{ strong: <strong /> }}
								/>
							</p>

							<h2 className="text-primary fw-semibold mb-2">
								<i className="bi bi-bar-chart-line-fill me-2"></i>
								{t("homepage.section2_title")}
							</h2>
							<p className="text-secondary mb-3">
								<Trans
									i18nKey="homepage.section2_description"
									components={{ strong: <strong /> }}
								/>
							</p>

							<h2 className="text-primary fw-semibold mb-2">
								<i className="bi bi-cpu-fill me-2"></i>
								{t("homepage.section3_title")}
							</h2>
							<p className="text-secondary mb-3">
								<Trans
									i18nKey="homepage.section3_description"
									components={{ strong: <strong /> }}
								/>
							</p>

							<h2 className="text-primary fw-semibold mb-2">
								<i className="bi bi-globe2 me-2"></i>
								{t("homepage.section4_title")}
							</h2>
							<p className="text-secondary mb-3">
								{t("homepage.section4_description")}
							</p>

							<h2 className="text-primary fw-semibold mb-2">
								<i className="bi bi-lock-fill me-2"></i>
								{t("homepage.section5_title")}
							</h2>
							<p className="text-secondary mb-3">
								{t("homepage.section5_description")}
							</p>
						</Card.Body>
					</Card>
				</Col>
			</Row>

			<Row className="justify-content-center">
				<Col md={6}>
					<Card className="shadow-sm border-0">
						<Card.Header
							as="h4"
							className="text-center text-primary bg-white border-0"
						>
							<i className="bi bi-person-circle me-2"></i>
							{t("auth.login")}
						</Card.Header>
						<Card.Body>
							{error && <Alert variant="danger">{error}</Alert>}

							<Form noValidate validated={validated} onSubmit={handleSubmit}>
								<Form.Group className="mb-3" controlId="formUsername">
									<Form.Label>{t("auth.username")}</Form.Label>
									<Form.Control
										type="text"
										required
										value={username}
										onChange={(e) => setUsername(e.target.value)}
										placeholder={t("auth.username")}
									/>
									<Form.Control.Feedback type="invalid">
										{t("auth.required")}
									</Form.Control.Feedback>
								</Form.Group>

								<Form.Group className="mb-4" controlId="formPassword">
									<Form.Label>{t("auth.password")}</Form.Label>
									<Form.Control
										type="password"
										required
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										placeholder={t("auth.password")}
									/>
									<Form.Control.Feedback type="invalid">
										{t("auth.required")}
									</Form.Control.Feedback>
								</Form.Group>

								<div className="d-grid">
									<Button variant="primary" type="submit" disabled={isLoading}>
										{isLoading ? t("app.loading") : t("auth.login")}
									</Button>
								</div>
							</Form>
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</Container>
	);
};

export default LoginPage;
