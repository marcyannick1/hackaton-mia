const validateUpdateUserProfile = (data) => {
  const errors = [];
  
  if (data.username !== undefined) {
    if (typeof data.username !== 'string' || data.username.length < 3 || data.username.length > 50) {
      errors.push('Le nom d\'utilisateur doit contenir entre 3 et 50 caractères');
    }
    if (!/^[a-zA-Z0-9]+$/.test(data.username)) {
      errors.push('Le nom d\'utilisateur ne peut contenir que des caractères alphanumériques');
    }
  }
  
  if (data.email !== undefined) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof data.email !== 'string' || !emailRegex.test(data.email) || data.email.length > 100) {
      errors.push('L\'adresse email doit être valide et ne pas dépasser 100 caractères');
    }
  }
  
  if (data.bio !== undefined) {
    if (typeof data.bio !== 'string' || data.bio.length > 500) {
      errors.push('La bio ne peut pas dépasser 500 caractères');
    }
  }
  
  if (data.profile_picture !== undefined && data.profile_picture !== '') {
    const urlRegex = /^https?:\/\/.+/;
    if (typeof data.profile_picture !== 'string' || !urlRegex.test(data.profile_picture)) {
      errors.push('L\'URL de la photo de profil doit être valide');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateChangePassword = (data) => {
  const errors = [];
  
  if (!data.newPassword) {
    errors.push('Le nouveau mot de passe est requis');
  } else if (typeof data.newPassword !== 'string' || data.newPassword.length < 6) {
    errors.push('Le mot de passe doit contenir au moins 6 caractères');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateSearchUsers = (data) => {
  const errors = [];
  
  if (!data.query) {
    errors.push('Le terme de recherche est requis');
  } else if (typeof data.query !== 'string' || data.query.length < 1 || data.query.length > 100) {
    errors.push('Le terme de recherche doit contenir entre 1 et 100 caractères');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateUpdateUserProfile,
  validateChangePassword,
  validateSearchUsers
};
