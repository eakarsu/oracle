const { getConfig } = require('../config/environment');

try {
  const config = getConfig();
  console.log(`Configuration valid for ${config.nodeEnv}; backend bind ${config.backendHost}:${config.backendPort}.`);
} catch (error) {
  console.error(`Configuration invalid: ${error.message}`);
  process.exitCode = 1;
}
