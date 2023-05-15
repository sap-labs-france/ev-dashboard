const convict = require('convict');
const fs = require('fs');

// Define a schema
const config = convict({
  env: {
    doc: 'The test environment.',
    format: ['local', 'production', 'development'],
    default: 'local',
    env: 'TEST_ENV',
  },
  trace_logs: {
    doc: 'Set to true to trace communication with servers',
    format: Boolean,
    default: 'false',
    env: 'TRACE_LOGS',
  },
  frontEndServer: {
    scheme: {
      doc: 'The SERVER server scheme.',
      format: ['http', 'https'],
      default: 'http',
      env: 'SERVER_SCHEME',
    },
    host: {
      doc: 'The SERVER server IP address to bind.',
      format: String,
      default: '127.0.0.1',
      env: 'SERVER_HOSTNAME',
    },
    port: {
      doc: 'The SERVER server port to bind.',
      format: 'port',
      default: 45000,
      env: 'SERVER_PORT',
      arg: 'server_port',
    },
    logs: {
      doc: '"json" to trace central server communication, "none" to not trace them',
      format: ['json', 'none'],
      default: 'none',
      env: 'SERVER_LOGS',
    },
  },
});

// Load environment dependent configuration
const env = config.get('env');
const fileName = './test/config/' + env + '.json';

if (fs.existsSync(fileName)) {
  config.loadFile(fileName);
}

// Perform validation
config.validate({
  allowed: 'strict',
});

module.exports = config;
