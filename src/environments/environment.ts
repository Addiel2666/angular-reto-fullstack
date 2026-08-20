export const environment = {
  production: false,
  // URL directa: el login funciona tanto con `ng serve` como con `npm start`.
  authApi: 'http://localhost:8082/api/auth',
  transactionApi: '/transaction-api',
  storageApi: 'http://localhost:8080/api/transaccion',
  // Debe ser EXACTAMENTE la misma clave de 32 caracteres que usa la primera API.
  aesKey: '12345678901234567890123456789012'
};
