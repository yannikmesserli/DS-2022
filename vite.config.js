import { join, resolve } from "path";
import { defineConfig } from "vite";

const talks = {
  ["web-editing-in-3d"]: [
    "editing-2d-to-3d",
    "tree",
    "antenna",
    "airplane",
    "airport-terminal",
    "feature-layer",
    "scene-layer",
  ],
  ["client-side-3d-analysis"]: [
    "direct-line-measurement",
    "direct-line-measurement-analysis",
    "area-measurement",
    "area-measurement-analysis",
    "line-of-sight",
    "line-of-sight-analysis",
    "shadow-cast",
    "elevation-profile",
    "query-attributes",
    "queries-and-filters/01-custom-popups",
    "queries-and-filters/02-filter-attributes",
    "queries-and-filters/03-timeslider",
    "queries-and-filters/04-query-attributes",
    "queries-and-filters/05-query-statistic",
    "queries-and-filters/06-query-geometry",
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
    minify: "esbuild",
  },
  resolve: {
    alias: {
      json2csv: "json2csv/dist/json2csv.umd.js",
    },
  },
}));
