export enum LandscapeType {
  DEVELOPMENT = 'development',
  QA = 'qa',
  PRODUCTION = 'production',
}

export default interface Landscape {
  type: LandscapeType;
}
