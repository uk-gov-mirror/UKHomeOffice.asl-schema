const EstablishmentModel = require('./establishment');
const PlaceModel = require('./place');
const RoleModel = require('./role');
const ProfileModel = require('./profile');
const AuthorisationModel = require('./authorisation');
const TrainingModuleModel = require('./training-module');
const PILModel = require('./pil');
const ProjectModel = require('./project');
const PermissionModel = require('./permission');

module.exports = db => {

  const Establishment = EstablishmentModel(db);
  const Place = PlaceModel(db);
  const Role = RoleModel(db);
  const Profile = ProfileModel(db);
  const Permission = PermissionModel(db);
  const Authorisation = AuthorisationModel(db);
  const PIL = PILModel(db);
  const Project = ProjectModel(db);
  const TrainingModule = TrainingModuleModel(db);

  Establishment.places = Establishment.hasMany(Place);
  Establishment.authorisations = Establishment.hasMany(Authorisation);
  Establishment.hasMany(Role);
  Establishment.belongsToMany(Profile, { through: Permission });
  Establishment.hasMany(PIL);
  Establishment.hasMany(Project);

  Place.nacwo = Place.belongsTo(Role, { as: 'nacwo' });
  Place.establishment = Place.belongsTo(Establishment, { as: 'establishment' });

  Role.profile = Role.belongsTo(Profile);
  Role.hasMany(Place, { foreignKey: 'nacwoId' });

  Profile.hasMany(Role);
  Profile.hasMany(TrainingModule, { foreignKey: 'profileId' });
  Profile.belongsToMany(Establishment, { through: Permission });
  Profile.pil = Profile.hasOne(PIL);
  Profile.hasMany(Project, { foreignKey: 'licenceHolderId' });

  PIL.establishment = PIL.belongsTo(Establishment);
  PIL.profile = PIL.belongsTo(Profile);

  Project.establishment = Project.belongsTo(Establishment);
  Project.holder = Project.belongsTo(Profile, { as: 'licenceHolder' });

  return {
    Establishment,
    Place,
    Role,
    Profile,
    Authorisation,
    PIL,
    Project,
    TrainingModule,

    sync: opts => db.sync(opts),
    close: () => db.close()
  };

};
