const db = require('./db');

function genId(prefix) {
  return prefix + '-' + Math.random().toString(16).slice(2, 8);
}

function logEvent(msg) {
  const log = db.get('log').value();
  log.unshift({ t: new Date().toLocaleTimeString(), msg });
  db.set('log', log.slice(0, 40)).write();
}

module.exports = { genId, logEvent };
