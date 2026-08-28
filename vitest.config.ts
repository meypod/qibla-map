import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// The units worth testing here are pure: coordinate parsing, angle maths, the
// geomagnetic model and the message tables. None of them need a Nuxt runtime,
// so the suite runs against the source directly with the same aliases the app
// uses.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./app", import.meta.url)),
      "~": fileURLToPath(new URL("./app", import.meta.url)),
    },
  },
  test: {
    include: ["test/**/*.spec.ts"],
    environment: "node",
  },
});
