export const environment = {
  production: true,
  appVersion: require('../../package.json').version,
  apiUrl: 'http://localhost:5000'
};
console.log('PROD appVersion ', environment.appVersion)
