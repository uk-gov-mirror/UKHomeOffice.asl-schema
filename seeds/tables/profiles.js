const { omit } = require('lodash');
const profiles = require('../data/profiles.json');

module.exports = {
  populate: knex => {
    return Promise.all(
      profiles.map(profile => {
        return knex('profiles')
          .insert(omit(profile, [
            'pil',
            'roles',
            'permissions',
            'projectId'
          ]))
          .returning('id')
          .then(ids => ids[0])
          .then(profileId => {
            return Promise.resolve()
              .then(() => {
                if (profile.permissions) {
                  return Promise.all(profile.permissions.map(permission => knex('permissions').insert({
                    ...permission,
                    profileId
                  })));
                }
              })
              .then(() => {
                if (profile.pil && profile.permissions.length) {
                  if (Array.isArray(profile.pil)) {
                    return Promise.all(profile.pil.map(pil => {
                      return knex('pils')
                        .insert({
                          status: 'active',
                          ...pil,
                          establishmentId: profile.permissions[0].establishmentId,
                          profileId
                        });
                    }));
                  }
                  return knex('pils')
                    .insert({
                      status: 'active',
                      ...profile.pil,
                      establishmentId: profile.permissions[0].establishmentId,
                      profileId
                    });
                }
              })
              .then(() => {
                if (profile.roles) {
                  return Promise.all(profile.roles.map(role => {
                    return knex('roles').insert({ ...role, profileId });
                  }));
                }
              });
          });
      })
    );
  },
  delete: knex => knex('pils').del()
    .then(() => knex('permissions').del())
    .then(() => knex('invitations').del())
    .then(() => knex('roles').del())
    .then(() => knex('asru_establishment').del())
    .then(() => knex('profiles').del())
};
