import React, { createContext, useContext, useState, useEffect } from "react";
import { loginUser } from "../services/api";

interface AuthContextType {
	isAuthenticated: boolean;
	token: string | null;
	login: (username: string, password: string) => Promise<boolean>;
	logout: () => void;
	error: string | null;
}

const AuthContext = createContext<AuthContextType>({
	isAuthenticated: false,
	token: null,
	login: async () => false,
	logout: () => {},
	error: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [token, setToken] = useState<string | null>(
		localStorage.getItem("token")
	);
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (token) {
			localStorage.setItem("token", token);
			setIsAuthenticated(true);
		} else {
			localStorage.removeItem("token");
			setIsAuthenticated(false);
		}
	}, [token]);

	const login = async (
		username: string,
		password: string
	): Promise<boolean> => {
		try {
			setError(null);
			const data = await loginUser(username, password);
			setToken(data.access_token); // ✅ ici le bon champ
			return true;
		} catch (err) {
			setError("Login failed. Please check your credentials.");
			return false;
		}
	};

	const logout = () => {
		setToken(null);
	};

	return (
		<AuthContext.Provider
			value={{ isAuthenticated, token, login, logout, error }}
		>
			{children}
		</AuthContext.Provider>
	);
};
