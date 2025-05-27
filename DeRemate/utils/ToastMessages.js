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
  RECOVER_FAIL: "Fallo al enviar el correo de recuperación: "
};

export const getErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'El correo electrónico ya está en uso';
    case 'auth/invalid-email':
      return 'El correo electrónico no es válido';
    case 'auth/weak-password':
      return 'La contraseña es demasiado débil';
    case 'auth/user-not-found':
      return 'No se encontró una cuenta con este correo';
    case 'auth/wrong-password':
      return 'Contraseña incorrecta';
    case 'auth/too-many-requests':
      return 'Demasiados intentos fallidos. Intenta más tarde';
    case 'auth/network-request-failed':
      return ToastMessages.NETWORK_FAIL;
    default:
      return 'Error desconocido';
  }
}; 