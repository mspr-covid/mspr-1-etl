import React, { useState } from "react";
import { Form, Link, useNavigate } from "react-router-dom";
import "./ConnectionPage.css";
const ApiUrl = 'http://localhost:8000';

export default function ConnectionPage() {
    /* State to store the data in the form */
    const [connectionForm, setConnectionForm] = useState({
        email: '',
        username: '',
        password: '',
    })

    /* State to get the errors from the form */
    const [formErrors, setFormErrors] = useState({
        email: '',
        username: '',
        password: '',
        form: '', // Pour les erreurs générales
    });

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    /* Function to save the data */
    const handleChange = (e) => {
        setConnectionForm({ ...connectionForm, [e.target.name]: e.target.value });
    };

    /* Function to handle the error messages */
    const setError = (name, message) => {
        setFormErrors((previousErrors) => ({
            ...previousErrors,
            [name]: message,
        }));
    };

    // function for success
    const setSucess = (name) => {
        setFormErrors((previousErrors) => ({
            ...previousErrors,
            [name]: "",
        }));
    };

    const validEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    // function for verificators : password
    const validPassword = (password) => {
        // Pour la démo, on simplifie la validation pour correspondre à l'API
        return password.length >= 8;
    };

    /* Function to validate all the inputs after the verificators */
    const validInputs = () => {
        const { email, username, password } = connectionForm;

        const fields = [
            {
                name: 'email',
                value: email,
                message: 'Un email est requis',
                errorMessage: "Le format de l'email est incorrect",
                validator: validEmail,
            },
            {
                name: "username",
                value: username,
                message: "Un pseudo est requis",
                minLength: 2,
                errorMessage: "Le pseudonyme doit contenir au moins 2 caractères",
            },

            {
                name: "password",
                value: password,
                message: "Un mot de passe est requis",
                minLength: 8,
                errorMessage: "Le mot de passe doit contenir au moins 8 caractères",
                validator: validPassword,
            },
        ];

        let allValid = true;

        fields.forEach(
            ({ name, value, message, minLength, errorMessage, validator }) => {
                if (value.trim() === '') {
                    setError(name, message);
                    allValid = false;
                } else if (minLength && value.length < minLength) {
                    setError(name, errorMessage);
                    allValid = false;
                } else if (validator && !validator(value)) {
                    setError(name, errorMessage);
                    allValid = false;
                } else {
                    setSucess(name);
                }
            }
        );
        return allValid;
    };

    /* Function to let user log - adaptée pour l'API FastAPI */
    const handleLogin = async (dataForm) => {
        try {
            // Format adapté à l'API FastAPI
            const loginData = {
                email: dataForm.email,
                username: dataForm.username,
                password: dataForm.password
            };

            const response = await fetch(`${ApiUrl}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loginData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                return { success: false, error: "Identifiant, email ou mot de passe incorrect" };
            }

            const data = await response.json();

            // Stocker le token JWT
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('username', dataForm.username);
            localStorage.setItem('email', dataForm.email);

            return { success: true };

        } catch (error) {
            console.error("Erreur lors de la connexion:", error);
            return { success: false, error: "Erreur de connexion au serveur" };
        }
    };

    /* Function to be able to send the data */
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validInputs()) {
            const result = await handleLogin(connectionForm);

            if (result.success) {
                navigate('/');
            } else {
                setError("form", result.error);
            }
            setLoading(false);
        }
    };

    return (
        <div className="background-ConnectionPage">
            <div className="connectionCard">
                <h1>Connexion</h1>

                <Form method="post" className="formconnection" onSubmit={handleSubmit}>
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Votre email"
                        aria-label="Entrez votre email"
                        value={connectionForm.email}
                        onChange={handleChange}
                        required
                    />
                    {formErrors.email && <div className="error">{formErrors.email}</div>}

                    <label htmlFor="username">Nom d'utilisateur</label>
                    <input
                        placeholder="Nom d'utilisateur"
                        type="text"
                        id="username"
                        name="username"
                        aria-label="Entrez votre nom d'utilisateur"
                        value={connectionForm.username}
                        onChange={handleChange}
                        required
                    />
                    {formErrors.username && <div className="error">{formErrors.username}</div>}
                     
                    <label htmlFor="password">Mot de passe</label>{" "}
                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Votre mot de passe"
                        aria-label=" Entrez votre mot de passe"
                        value={connectionForm.password}
                        onChange={handleChange}
                        required
                    />
                  
                    {formErrors.password && <div className="error">{formErrors.password}</div>}
                <div className="button-form">
                    <button
                        className="buttonconnection"
                        type="submit"
                        aria-label="Connexion"
                        disabled={loading}
                    >
                        {loading ? 'Chargement...' : 'Se connecter'}
                    </button>

                    <Link to="/registration">
                        <button
                            className="buttonCreateProfil"
                            type="button"
                            aria-label="Créer un profil"
                        >
                            Créer un compte
                        </button>
                    </Link>
                </div>
                </Form>
                <h4>Mot de passe oublié ?</h4>
            </div>
        </div>
    );
}