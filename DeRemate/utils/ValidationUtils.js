export const ValidationUtils = {
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isPasswordSecure: (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!?.*()_\-]).{8,}$/;
    return passwordRegex.test(password);
  },

  validateLoginForm: (email, password) => {
    if (!email || !password) {
      return { isValid: false, message: 'Complete todos los campos.' };
    }
    return { isValid: true };
  },

  validateRegisterForm: (email, password, confirmPassword) => {
    if (!email || !password || !confirmPassword) {
      return { isValid: false, message: 'Complete todos los campos.' };
    }

    if (!ValidationUtils.isValidEmail(email)) {
      return { isValid: false, message: 'El email ingresado no es válido.' };
    }

    if (!ValidationUtils.isPasswordSecure(password)) {
      return { 
        isValid: false, 
        message: 'La contraseña es muy débil. Debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y símbolos.' 
      };
    }

    if (password !== confirmPassword) {
      return { isValid: false, message: 'Las contraseñas no coinciden.' };
    }

    return { isValid: true };
  },

  validateRecoverForm: (email) => {
    if (!email.trim()) {
      return { isValid: false, message: 'Complete todos los campos.' };
    }

    if (!ValidationUtils.isValidEmail(email)) {
      return { isValid: false, message: 'El email ingresado no es válido.' };
    }

    return { isValid: true };
  }
}; 