const { readdirSync } = require('fs');

function load() {
  const files = readdirSync(`${__dirname}/data`);

  return files.map(file => require(`./data/${file}`));
}

module.exports = load();
