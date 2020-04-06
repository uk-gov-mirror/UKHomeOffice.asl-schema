const { uniq } = require('lodash');

const transform = version => {
  if (!version) {
    return;
  }
  if (version['fate-of-animals-nts'] === false) {
    version['fate-of-animals'] = uniq([
      ...(version['fate-of-animals'] || []),
      'killed'
    ]);
  }
  return version;
};

exports.transform = transform;

exports.up = function(knex) {
  return Promise.resolve()
    .then(() => {
      return knex('project_versions')
        .select('project_versions.id')
        .join('projects', 'project_versions.project_id', 'projects.id')
        .where({ 'schema_version':  1 });
    })
    .then(versions => {
      console.log(`found ${versions.length} versions`)
      return versions.reduce((promise, version, index) => {
        return promise
          .then(() => {
            console.log(`patching version: ${version.id}, ${index + 1} of ${versions.length}`);
            return knex('project_versions')
              .select('id', 'data')
              .where({ id: version.id })
              .first()
              .then(version => {
                const data = transform(version.data);
                if (!data) {
                  return Promise.resolve();
                }
                return knex('project_versions')
                  .where({ id: version.id })
                  .update({ data });
              })
              .then(() => {
                console.log(`finshed patching version: ${version.id}, ${index + 1} of ${versions.length}`);
              })
          })
          .catch(e => {
            console.error(`Failed to update project version: ${version.id}`);
            console.error(e.stack);
            throw e;
          });
      }, Promise.resolve());
    });
};

exports.down = function(knex) {
  return Promise.resolve();
};
