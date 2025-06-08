import { Navbar, Nav, Container } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import LanguageSelector from "./LanguageSelector";

const Navigation = () => {
	const { t } = useTranslation();
	const { isAuthenticated, logout } = useAuth();
	const location = useLocation();

	return (
		<Navbar bg="light" expand="lg" className="mb-3">
			<Container>
				<Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
					<img
						src="/favicon.svg"
						alt="Logo"
						width="32"
						height="32"
						className="me-2"
					/>
					{t("app.title")}
				</Navbar.Brand>

				<Navbar.Toggle aria-controls="basic-navbar-nav" />
				<Navbar.Collapse id="basic-navbar-nav">
					<Nav className="me-auto">
						{isAuthenticated && (
							<>
								<Nav.Link as={Link} to="/" active={location.pathname === "/"}>
									{t("nav.home")}
								</Nav.Link>
								<Nav.Link
									as={Link}
									to="/countries/manage"
									active={location.pathname === "/countries/manage"}
								>
									{t("nav.manage")}
								</Nav.Link>
								<Nav.Link
									as={Link}
									to="/predict"
									active={location.pathname === "/predict"}
								>
									{t("nav.predict")}
								</Nav.Link>
							</>
						)}
					</Nav>
					<Nav className="d-flex align-items-center">
						<LanguageSelector />
						{isAuthenticated ? (
							<Nav.Link onClick={logout} className="ms-2">
								{t("nav.logout")}
							</Nav.Link>
						) : (
							<Nav.Link
								as={Link}
								to="/login"
								active={location.pathname === "/login"}
								className="ms-2"
							>
								{t("nav.login")}
							</Nav.Link>
						)}
					</Nav>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);
};

export default Navigation;
