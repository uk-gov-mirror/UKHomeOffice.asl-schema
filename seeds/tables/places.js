const uuid = require('uuid/v4');
const { mapValues, omit, flatten, isEmpty, concat } = require('lodash');
const { suitabilityCodes, holdingCodes } = require('@asl/constants');
const places = require('../data/places.json').map(p => ({ id: uuid(), ...p }));

const getNonRandomRole = require('./utils/get-non-random-item');

module.exports = {
  populate: knex => {
    return Promise.resolve()
      .then(() => {
        return Promise.all(places.map(place => {
          place.holding = place.holding || holdingCodes.slice(1, 2);
          place.suitability = place.suitability || suitabilityCodes.slice(1, 2);
          return knex('places')
            .insert({
              ...mapValues(omit(place, 'roles'), (val, key) => {
                if (key === 'holding' || key === 'suitability') {
                  return JSON.stringify(val);
                }
                return val;
              })
            });
        }));
      })
      .then(() => knex('places').select('id'))
      .then(placeIds => {

        return knex('roles').whereIn('type', ['nacwo', 'nvs', 'sqp']).where('establishment_id', 8201)
          .then(roles => {
            const placesWithRolesDefined = places.filter(place => place.roles !== undefined);
            const placesWithoutRolesDefined = places.filter(place => !place.roles);

            const seededPlaceRoles = flatten(placesWithRolesDefined.map(place => {
              if (Array.isArray(place.roles) && !isEmpty(place.roles)) {
                return place.roles.map(roleId => ({
                  role_id: roleId,
                  place_id: place.id
                }));
              }
            })).filter(Boolean);

            const randomPlaceRoles = placesWithoutRolesDefined.map(place => {
              return {
                place_id: place.id,
                role_id: getNonRandomRole(roles, place.name)
              };
            });

            return knex('place_roles').insert(concat(seededPlaceRoles, randomPlaceRoles));
          });
      });
  },
  delete: knex => knex('places').del()
};
