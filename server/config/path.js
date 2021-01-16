const moduleAlias = require('module-alias');
const { join } = require('path');

const root = join(__dirname, '..');

exports.alias = {
  '~root': root,
  '~config': `${root}/config`,
  '~utils': `${root}/utilities`,
  '~routes': `${root}/api/routes`,
  '~controllers': `${root}/api/controllers`,
  '~services': `${root}/api/services`,
  '~middleware': `${root}/api/middleware`,
  '~database': `${root}/api/database`,
  '~exceptions': `${root}/api/exceptions`,
  '~subcribers': `${root}/api/subcribers`
};

moduleAlias.addAliases(this.alias);
