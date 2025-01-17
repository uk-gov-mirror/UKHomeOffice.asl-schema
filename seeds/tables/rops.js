const rops = require('../data/rops');

const defaults = {
  basicSubpurposes: JSON.stringify([ 'oncology' ]),
  endangered: false,
  ga: false,
  newGeneticLine: false,
  nmbas: false,
  otherSpecies: true,
  placesOfBirth: JSON.stringify([ 'uk-licenced' ]),
  postnatal: true,
  proceduresCompleted: true,
  productTesting: false,
  purposes: JSON.stringify([ 'basic' ]),
  reuse: false,
  rodenticide: false,
  scheduleTwoDetails: null,
  species: JSON.stringify({ precoded: ['mice'], otherSpecies: [] })
};

module.exports = {
  populate: knex => knex('rops').insert(
    rops.map(rop => ({
      ...defaults,
      submittedDate: rop.status === 'submitted' ? (new Date()).toISOString() : null,
      ...rop
    }))
  ),
  delete: knex => knex('rops').del()
};
