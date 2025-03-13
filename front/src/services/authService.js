// src/services/authService.js
const ApiUrl = "";

export const handleSignUp = async ({ formData }) => {
  try {
    const response = await fetch(`${ApiUrl}/api/user/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    
    // Si le serveur répond, essayez de parser la réponse
    let responseData;
    try {
      responseData = await response.json();
    } catch (e) {
      // Si la réponse n'est pas du JSON valide
      responseData = { message: "Erreur de communication avec le serveur" };
    }
    
    if (response.status === 401) {
      alert("Le pseudo existe déjà");
      return { success: false, error: "Le pseudo existe déjà" };
    }
    
    if (response.status !== 201) {
      return { 
        success: false, 
        error: responseData.detail || responseData.message || "Erreur lors de l'inscription" 
      };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    return { success: false, error: "Problème de connexion au serveur. Veuillez réessayer." };
  }
};