module.exports = function (context, options) {
  return {
    name: "raw-loaders",
    configureWebpack(config, isServer) {
      return {
        module: {
          rules: [
            { test: /\.(glsl|vert|frag|txt)$/, type: 'asset/source' },
          ],
        },
      };
    },
  };
};
