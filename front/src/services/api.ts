import axios from "axios";
import CountryInput from "../types/CountryInput";
import CountryInputPredict from "../types/CountryInputPredict";

const API_URL = "https://covid-app.fly.dev";

// Create axios instance
const api = axios.create({
	baseURL: API_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (
			error.response &&
			(error.response.status === 401 || error.response.status === 403)
		) {
			localStorage.removeItem("token");
			window.location.href = "/login";
		}
		return Promise.reject(error);
	}
);

// Add token to requests if available
api.interceptors.request.use((config) => {
	const token = localStorage.getItem("token");
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

// ✅ Auth API - Corrigé pour FastAPI (qui attend des données de formulaire)
export const loginUser = async (username: string, password: string) => {
	const params = new URLSearchParams();
	params.append("username", username);
	params.append("password", password);

	const response = await api.post("/api/login", params, {
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
	});

	console.log("loginUser response:", response.data);
	return response.data; // <-- ici on récupère bien le token
};

// Countries API
export const getCountries = async () => {
	const response = await api.get("/covid");
	return response.data;
};

// export const getCountry = async (id: string) => {
// 	const response = await api.get(`/countries/${id}`);
// 	return response.data;
// };

export const createCountry = async (countryData: CountryInput) => {
	const response = await api.post("/covid", countryData);
	return response.data;
};

export const updateCountry = async (id: string, countryData: string) => {
	const response = await api.put(`/countries/${id}`, countryData);
	return response.data;
};

export const deleteCountry = async (country: string) => {
	const response = await api.delete(`/covid/${country}`);
	return response.data;
};

export const getPrediction = async (data: {
	total_recovered: number;
	serious_critical: number;
	total_tests: number;
}) => {
	const response = await api.post("/covid/predict", data);
	return response.data;
};

export const getPredictionV2 = async (data: CountryInputPredict) => {
	const response = await api.post("/covid/predictV2", data);
	return response.data;
};

export const getLearningCurves = async () => {
	const response = await api.get("/learning_curve");
	console.log(response.data);
	console.log(
		"Test image URL:",
		"https://covid-app.fly.dev/static/plots/learning_curve_linear_regression.png"
	);

	return response.data;
};

export const getResidualPlots = async () => {
	const response = await api.get("/residual_plot");
	return response.data;
};

export default api;
export { API_URL };
