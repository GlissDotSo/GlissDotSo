const { withSentryConfig } = require("@sentry/nextjs");
const withPlugins = require("next-compose-plugins");
const { withPlausibleProxy } = require("next-plausible");
const withTM = require("next-transpile-modules")(["@glissdotso/core"]);
const withNextra = require("nextra")({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.js",
  unstable_staticImage: true,
});

const SentryWebpackPluginOptions = {
  silent: false,
};

const plugins = [
  nextConfig => {
    if (process.env.VERCEL_ENV === "development") {
      return {};
    }
    return withSentryConfig(nextConfig, SentryWebpackPluginOptions);
  },
  withNextra,
  withPlausibleProxy,
  withTM,
];

/**
 * @type {import('next').NextConfig}
 */
const config = {
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = withPlugins(plugins, config);
