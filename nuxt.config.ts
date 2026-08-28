// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  ssr: false,

  // The page is client-rendered, so useHead only fills these in after
  // hydration. These are the values the tab, bookmarks and any crawler see
  // before that; the page then replaces them with localized ones.
  app: {
    head: {
      title: "Qibla Map",
      meta: [
        {
          name: "description",
          content:
            "A simple Qibla finder that shows the Qibla direction on a map.",
        },
      ],
    },
  },

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
    injectRegister: "auto",

    pwaAssets: {
      disabled: false,
      config: true,
    },

    manifest: {
      name: "Qibla Map",
      short_name: "Qibla Map",
      description:
        "a simple Qibla finder that shows Qibla direction on the map",
      theme_color: "#343434",
    },

    workbox: {
      globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
      cleanupOutdatedCaches: true,
      clientsClaim: true,

      runtimeCaching: [
        {
          // Serve map tiles from the cache first. OpenStreetMap runs its tile
          // servers on donated capacity and asks that clients not re-request
          // what they already have, so every hit here is a request their
          // infrastructure does not have to serve. It also means a previously
          // visited area still draws with no connection.
          urlPattern: ({ url }) => url.hostname === "tile.openstreetmap.org",
          handler: "CacheFirst",
          options: {
            cacheName: "osm-tiles",
            expiration: {
              // Roughly the area around a few places a person actually uses,
              // kept about as long as OSM's own cache headers allow.
              maxEntries: 500,
              maxAgeSeconds: 60 * 60 * 24 * 7,
              purgeOnQuotaError: true,
            },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
      ],
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

  experimental: {
    payloadExtraction: true,
  },
});
