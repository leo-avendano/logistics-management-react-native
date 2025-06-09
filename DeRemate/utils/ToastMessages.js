export const ToastMessages = {
  EMPTY_FIELDS: "Complete todos los campos.",
  INVALID_EMAIL: "El email ingresado no es válido.",
  PASSWORD_MISMATCH: "Las contraseñas no coinciden.",
  PASSWORD_TOO_WEAK: "La contraseña es muy débil.",
  REGISTER_SUCCESS: "Registro exitoso. Verifique su correo antes de iniciar sesión.",
  REGISTER_FAIL: "Hubo un error al registrarse: ",
  REGISTER_UNKNOWN_FAIL: "Hubo un error desconocido al registrarse.",
  EMAIL_NOT_CONFIRMED: "Debe verificar su correo electrónico antes de ingresar",
  INVALID_LOGIN: "Usuario o contraseña equivocadas.",
  NETWORK_FAIL: "Hubo un problema de conexión a la red, inténtelo más tarde",
  RECOVER_FAIL: "Fallo al enviar el correo de recuperación: ",
  LOGIN_FAILED: "No pudimos iniciar sesión con esas credenciales",
  ACCOUNT_DISABLED: "Tu cuenta ha sido deshabilitada. Contacta al soporte",
  INVALID_CREDENTIAL: "Las credenciales ingresadas no son válidas",
  USER_DISABLED: "Esta cuenta ha sido deshabilitada temporalmente"
};

export const getErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'Ya existe una cuenta con este correo electrónico';
    case 'auth/invalid-email':
      return 'El formato del correo electrónico no es válido';
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres';
    case 'auth/user-not-found':
      return 'No encontramos una cuenta con este correo electrónico';
    case 'auth/wrong-password':
      return 'La contraseña ingresada es incorrecta';
    case 'auth/invalid-credential':
      return 'Correo o contraseña incorrectos. Verifica tus datos e intenta nuevamente';
    case 'auth/user-disabled':
      return ToastMessages.USER_DISABLED;
    case 'auth/too-many-requests':
      return 'Has hecho demasiados intentos. Espera unos minutos e intenta nuevamente';
    case 'auth/network-request-failed':
      return ToastMessages.NETWORK_FAIL;
    case 'auth/operation-not-allowed':
      return 'El método de autenticación no está habilitado';
    case 'auth/requires-recent-login':
      return 'Por seguridad, necesitas iniciar sesión nuevamente';
    case 'auth/account-exists-with-different-credential':
      return 'Ya existe una cuenta con este correo usando otro método';
    default:
      return ToastMessages.LOGIN_FAILED;
  }
}; 