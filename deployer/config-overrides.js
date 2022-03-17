module.exports = function override(config, env) {
    //do stuff with the webpack config...

    let rules = config.module.rules[1].oneOf
    rules.splice(rules.length - 1, 0, {
        test: /\.clar$/i,
        use: 'raw-loader',
    })

    return config
  }