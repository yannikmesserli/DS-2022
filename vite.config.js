import { readdirSync } from "fs";
import { join, resolve } from "path";
import { defineConfig } from "vite";

const talks = ["web-editing-in-3d", "client-side-3d-analysis"];

const input = {
  ...talks.reduce((res, talkFolder) => {
    const talkFolderPath = resolve(__dirname, talkFolder);

    res[talkFolder] = resolve(talkFolderPath, "index.html");

    const samplesFolder = resolve(talkFolderPath, "samples");
    const sampleFolders = readdirSync(samplesFolder, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    for (const sampleFolder of sampleFolders) {
      res[`${talkFolder}/${sampleFolder}`] = resolve(samplesFolder, sampleFolder, "index.html");
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
