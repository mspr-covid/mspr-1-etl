import { Routes, Route, Navigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import Navigation from "./components/Navigation";
import LoginPage from "./pages/LoginPage";
import CountriesPage from "./pages/CountriesPage";
import CountryFormPage from "./pages/CountryFormPage";
import PredictionPage from "./pages/PredictionPage";
import DataVisualization from "./pages/DataVisualization";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import PlotVisualization from "./pages/PlotVisualization";
import Footer from "./components/Footer";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
	const { isAuthenticated } = useAuth();

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	return <>{children}</>;
};

function AppContent() {
	const { isAuthenticated } = useAuth();

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
						path="/datavisualization"
						element={
							<ProtectedRoute>
								<DataVisualization />
							</ProtectedRoute>
						}
					/>

					<Route
						path="/ml-visualization"
						element={
							<ProtectedRoute>
								<PlotVisualization />
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

			<Footer />
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
