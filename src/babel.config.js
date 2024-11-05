module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo','react-app'],
  "plugins": [
    "@babel/plugin-proposal-private-property-in-object"
  ]
  };
};
