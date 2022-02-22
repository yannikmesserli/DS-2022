import { resolve } from "path";
import { defineConfig } from "vite";

const samples = [
  "direct-line-measurement",
  "direct-line-measurement-analysis",
  "area-measurement",
  "area-measurement-analysis",
  "line-of-sight",
  "line-of-sight-analysis",
  "shadow-cast",
  "elevation-profile",
];

module.exports = defineConfig(({ command }) => ({
  base: command === "build" ? "https://zrh-dev-local/DS-2022/dist/" : "./",
  build: {
    rollupOptions: {
      input: {
        ["Client-Side-3D-Analysis"]: resolve(__dirname, "Client-Side-3D-Analysis", "index.html"),
        ...samples.reduce((res, name) => {
          res[name] = resolve(__dirname, `Client-Side-3D-Analysis/samples`, name, "index.html");
          return res;
        }, {}),
      },
    },
  },
  resolve: {
    alias: {
      json2csv: "json2csv/dist/json2csv.umd.js",
    },
  },
}));
