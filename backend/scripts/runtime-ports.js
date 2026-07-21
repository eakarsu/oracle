const { getConfig } = require('../config/environment');

try {
  const config = getConfig();
  process.stdout.write(`${config.backendPort}\n${config.frontendPort}\n`);
} catch (error) {
  console.error(`Configuration invalid: ${error.message}`);
  process.exitCode = 1;
}
