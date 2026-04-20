/* eslint-disable @typescript-eslint/no-require-imports */
// Carga las variables de entorno del .env igual que setup-env.js
require('./setup-env.js');

// Node.js 18+ resuelve "localhost" como ::1 (IPv6) primero.
// Docker publica Postgres solo en 127.0.0.1, por lo que la conexión falla.
// Forzamos IPv4 explícitamente para el entorno de test.
if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace('localhost', '127.0.0.1');
}

module.exports = async function () {};
