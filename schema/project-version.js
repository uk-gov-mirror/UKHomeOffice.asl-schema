const BaseModel = require('./base-model');
const { uuid } = require('../lib/regex-validation');

class ProjectVersion extends BaseModel {
  static get tableName() {
    return 'projectVersions';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      additionalProperties: false,
      properties: {
        id: { type: 'string', pattern: uuid.v4 },
        data: { type: ['object', 'null'] },
        projectId: { type: 'string', pattern: uuid.v4 },
        grantedAt: { type: ['string', 'null'], format: 'date-time' },
        submittedAt: { type: ['string', 'null'], format: 'date-time' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        deleted: { type: ['string', 'null'], format: 'date-time' }
      }
    };
  }

  static get(id) {
    return this.query()
      .findById(id)
      .eager('project');
  }

  static get relationMappings() {
    return {
      project: {
        relation: this.BelongsToOneRelation,
        modelClass: `${__dirname}/project`,
        join: {
          from: 'projectVersions.projectId',
          to: 'projects.id'
        }
      }
    };
  }

}

module.exports = ProjectVersion;
