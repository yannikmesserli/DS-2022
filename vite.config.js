import { join, resolve } from "path";
import { defineConfig } from "vite";

const talks = {
  ["web-editing-in-3d"]: ["editing-2d-to-3d", "airport", "feature-layer", "advanced-editing"],
  ["client-side-3d-analysis"]: [
    "direct-line-measurement",
    "direct-line-measurement-analysis",
    "area-measurement",
    "area-measurement-analysis",
    "line-of-sight",
    "line-of-sight-analysis",
    "shadow-cast",
    "elevation-profile",
  ],
};

const input = {
  ...Object.entries(talks).reduce((res, [talkFolder, samples]) => {
    res[talkFolder] = resolve(__dirname, talkFolder, "index.html");
    for (const sampleFolder of samples) {
      const path = join(talkFolder, "samples", sampleFolder);
      res[path] = resolve(__dirname, path, "index.html");
    }

    return res;
  }, {}),
};

module.exports = defineConfig(({ command }) => ({
  base: command === "build" ? "https://zrh-dev-local/DS-2022/dist/" : "./",
  build: {
    rollupOptions: { input },
  },
  resolve: {
    alias: {
      json2csv: "json2csv/dist/json2csv.umd.js",
    },
  },
}));
