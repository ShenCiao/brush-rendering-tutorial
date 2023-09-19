module.exports = function (context, options) {
  return {
    name: "raw-loaders",
    configureWebpack(config, isServer) {
      return {
        module: {
          rules: [
            { test: /\.(glsl|vert|frag)$/, type: "asset/source" },
            { test: /\.m?js$/, resourceQuery: { not: [/raw/] }, use: [ 'babel-loader' ] },
            { resourceQuery: /raw/, type: 'asset/source' }
          ],
        },
      };
    },
  };
};
