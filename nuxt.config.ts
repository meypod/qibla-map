// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  ssr: false,

  nitro: {
    prerender: {
      routes: ["/"],
    },
  },

  modules: [
    "@vite-pwa/nuxt",
    "@nuxt/eslint",
    "@nuxtjs/tailwindcss",
    "@vueuse/nuxt",
  ],

  pwa: {
    registerType: "autoUpdate",
    injectRegister: false,

    pwaAssets: {
      disabled: false,
      config: true,
    },

    manifest: {
      name: "Qibla Map",
      short_name: "Qibla Map",
      description:
        "a simple Qibla finder that shows Qibla direction on the map",
      theme_color: "#ffffff",
    },

    workbox: {
      globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
      cleanupOutdatedCaches: true,
      clientsClaim: true,
    },

    devOptions: {
      enabled: false,
      suppressWarnings: true,
      navigateFallback: "/",
      navigateFallbackAllowlist: [/^\/$/],
      type: "module",
    },

    experimental: {
      enableWorkboxPayloadQueryParams: true,
    },

    registerWebManifestInRouteRules: true,

    client: {
      installPrompt: true,
    },
  },
});
