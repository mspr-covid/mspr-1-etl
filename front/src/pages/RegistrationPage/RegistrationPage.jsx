import { useState } from "react";
import { Form, Link, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import "./RegistrationPage.css";

export default function RegistrationPage({ handleSignUp }) {
  const navigate = useNavigate();
  
  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
  });

  const [formErrors, setFormErrors] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
    form: "",
  });

  const [loading, setLoading] = useState(false);

  /* This function updates the form state by creating a new object with all existing form values and modifying only the field that changed */
  const handleChange = (e) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
  };

  /* This function updates the form errors state by setting a specific error message for a given field while preserving other error messages */
  const setError = (name, message) => {
    setFormErrors((previousErrors) => ({
      ...previousErrors,
      [name]: message,
    }));
  };

  const setSuccess = (name) => {
    setFormErrors((previousErrors) => ({
      ...previousErrors,
      [name]: "",
    }));
  };

  const validEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(String(email).toLowerCase());
  };

  const validPassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(String(password));
  };

  const validInputs = () => {
    const { username, email, password, password2 } =
      registerForm;
    const fields = [
      {
        name: "username",
        value: username,
        message: "Un pseudo est requis",
        minLength: 2,
        errorMessage: "Le nom d'utilisateur doit contenir au moins 2 caractères",
      },
      {
        name: "email",
        value: email,
        message: "Un mail est requis",
        errorMessage: "Veuillez donner un mail valide",
      },
      {
        name: "password",
        value: password,
        message: "Un mot de passe est requis",
        minLength: 8,
        errorMessage:
          "Le mot de passe doit avoir 8 caractères minimum dont au moins une majuscule , un nombre et un caractère spécial",
      },
      {
        name: "password2",
        value: password2,
        message: "Veuillez confirmer votre mot de passe",
        match: password,
        errorMessage: "Le mot de passe doit être identique au précédent",
      }
    ];

    let allValid = true;

    fields.forEach(
      ({ name, value, message, errorMessage, minLength, match }) => {
        if (value.trim() === "") {
        setError(name, message);
        allValid = false;
      } else if (minLength && value.length < minLength) {
        setError(name, errorMessage);
        allValid = false;
        } else if (name === "email" && !validEmail(value)) {
        setError(name, errorMessage);
        allValid = false;
      } else if (name === "password" && !validPassword(value)) {
        setError(name, errorMessage);
        allValid = false;
      } else if (match !== undefined && value !== match) {
        setError(name, errorMessage);
        allValid = false;
      } else {
        setSuccess(name);
      }
      }
    );
    return allValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = {
      username: registerForm.username,
      email: registerForm.email,
      password: registerForm.password,
    };

    if (validInputs() === true) {
      try {
        const result = await handleSignUp({ formData });

        if (result.success) {
          window.location.href = "/connection";
        } else {
          setError("form", result.error || "Erreur lors de l'inscription");
        }
      } catch (error) {
        setError("form", "Erreur de connexion au serveur");
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  return (
    <div className="backgroundRegistration">
      <div className="cardRegistration">

        <h1>Créer votre profil</h1>
        <Form
          method="post"
          onSubmit={handleSubmit}
          className="formRegistration"
        >
          {formErrors.form && (
            <div className="error form-error">{formErrors.form}</div>
          )}
          
          <label htmlFor="username">Nom d'utilisateur</label>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Nom d'utilisateur"
            aria-label="Entrez un nom d'utilisateur"
            value={registerForm.username}
            onChange={handleChange}
            required
          />

          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Votre email"
            value={registerForm.email}
            onChange={handleChange}
            aria-label=" Entrez une adresse e-mail valide"
            required
          />
          {formErrors.email !== "" && (
            <div className="error">{formErrors.email}</div>
          )}

          <label htmlFor="password">Mot de passe</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Entrez votre mot de passe"
            value={registerForm.password}
            onChange={handleChange}
            aria-label=" Entrer un mot de passe valide"
          />
          {formErrors.password !== "" && (
            <div className="error">{formErrors.password}</div>
          )}
          <label htmlFor="password2">Confirmer votre mot de passe</label>
          <input
            type="password"
            id="password2"
            name="password2"
            placeholder="Entrez à nouveau votre mot de passe"
            value={registerForm.password2}
            onChange={handleChange}
            aria-label=" Entrez un mot de passe identique au précédent"
          />
          {formErrors.password2 !== "" && (
            <div className="error">{formErrors.password2}</div>
          )}
          <button
            className="buttonregistration"
            type="submit"
            aria-label="Valider votre compte"
            disabled={loading}
          >
            {loading ? 'Chargement...' : 'Valider'}
          </button>
        </Form>
      </div>
    </div>
  );
}

RegistrationPage.propTypes = {
  handleSignUp: PropTypes.func.isRequired,
};