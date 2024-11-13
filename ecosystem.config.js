module.exports = {
    apps: [
      {
        name: "node-js-back-auth-prod",
        script: "./index.js",
        env_production: {
          NODE_ENV: "PROD",
          PORT: 3333,
          watch: false,
          autorestart: false,

        },
      },
      {
        name: "node-js-back-auth-dev",
        script: "./index.js",
        env_development: {
          NODE_ENV: "DEV",
          PORT: 3003,
          watch: true,
          autorestart: true,
          watch: ["index.js", "src"],
          ignore_watch: ["node_modules"],
        },
      },
    ],
  };