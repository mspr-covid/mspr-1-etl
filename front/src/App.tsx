import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import { useTranslation } from "react-i18next";

import Navigation from "./components/Navigation";
import LoginPage from "./pages/LoginPage";
import CountriesPage from "./pages/CountriesPage";
import CountryFormPage from "./pages/CountryFormPage";
import PredictionPage from "./pages/PredictionPage";
import LanguageSelector from "./components/LanguageSelector";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
	const { isAuthenticated } = useAuth();

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	return <>{children}</>;
};

function AppContent() {
	const { isAuthenticated } = useAuth();
	const { t } = useTranslation();

	return (
		<div className="d-flex flex-column min-vh-100">
			<Navigation />
			<Container className="flex-grow-1 py-4">
				<Routes>
					<Route
						path="/login"
						element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />}
					/>
					<Route
						path="/"
						element={
							<ProtectedRoute>
								<CountriesPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/countries/manage"
						element={
							<ProtectedRoute>
								<CountryFormPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/predict"
						element={
							<ProtectedRoute>
								<PredictionPage />
							</ProtectedRoute>
						}
					/>
					<Route path="*" element={<Navigate to="/" />} />
				</Routes>
			</Container>
			<footer className="bg-light py-3 border-top">
				<Container>
					<div className="d-flex justify-content-between align-items-center">
						<p className="mb-0 text-muted">
							&copy; 2025 {t("covid.dashboard")}
						</p>
					</div>
				</Container>
			</footer>
		</div>
	);
}

function App() {
	return (
		<AuthProvider>
			<AppContent />
		</AuthProvider>
	);
}

export default App;
