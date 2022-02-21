// @ts-check
import { initView, onInit } from "../utils.js";

let view, widget;

// Move in once analysis objects are done:
// https://zrh-app-sd-2.esri.com/arcgis-play/a/hcampos_zurich/devsummit-2022---areameasurementanalysis

onInit("area-measurement-analysis", () => {
  view = initView();
});
