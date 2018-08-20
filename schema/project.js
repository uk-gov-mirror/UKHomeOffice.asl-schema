const BaseModel = require('./base-model');
const Profile = require('./profile');
const { projectStatuses } = require('@asl/constants');

class Project extends BaseModel {
  static get tableName() {
    return 'projects';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['title', 'establishmentId'],
      additionalProperties: false,
      properties: {
        id: { type: 'string' },
        'migrated_id': { type: 'string' },
        status: {
          type: 'string',
          enum: projectStatuses
        },
        title: { type: 'string' },
        issueDate: { type: ['string', 'null'] },
        expiryDate: { type: ['string', 'null'] },
        revocationDate: { type: ['string', 'null'] },
        licenceNumber: { type: ['string', 'null'] },
        'created_at': { type: 'string' },
        'updated_at': { type: 'string' },
        establishmentId: { type: 'integer' },
        licenceHolderId: { type: ['string', 'null'] },
        deleted: { type: ['string', 'null'] }
      }
    };
  }

  static count(establishmentId) {
    return this.query()
      .where({ establishmentId })
      .where('expiryDate', '>=', new Date())
      .count()
      .then(result => result[0].count);
  }

  static search({ establishmentId, search, sort = {}, limit, offset }) {
    let query = this.query()
      .distinct('projects.*')
      .where({ establishmentId })
      .where('expiryDate', '>=', new Date())
      .leftJoinRelation('licenceHolder')
      .eager('licenceHolder');

    if (search) {
      query.where(builder => {
        return builder
          .where('projects.title', 'iLike', `%${search}%`)
          .orWhere('licenceNumber', 'iLike', `%${search}%`)
          .orWhere(b => {
            Profile.searchFullName({
              search,
              prefix: 'licenceHolder',
              query: b
            });
          });
      });
    }

    if (sort.column) {
      query = this.orderBy({ query, sort });
    } else {
      query.orderBy('expiryDate');
    }

    query = this.paginate({ query, limit, offset });

    return query;
  }

  static get relationMappings() {
    return {
      licenceHolder: {
        relation: this.BelongsToOneRelation,
        modelClass: `${__dirname}/profile`,
        join: {
          from: 'projects.licenceHolderId',
          to: 'profiles.id'
        }
      },
      establishment: {
        relation: this.BelongsToOneRelation,
        modelClass: `${__dirname}/establishment`,
        join: {
          from: 'projects.establishmentId',
          to: 'establishments.id'
        }
      }
    };
  }
}

module.exports = Project;
