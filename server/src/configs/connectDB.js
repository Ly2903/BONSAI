const config = {
  server: "LYTRAN\\SERVER",
  database: "BONSAI",
  user: "sa",
  driver: "msnodesqlv8",
  password: "123",
  port: 1433,
  options: {
    trustServerCertificate: true,
    enableArithAbort: true, // Enable this option based on your needs
  },
};

module.exports = { config };
