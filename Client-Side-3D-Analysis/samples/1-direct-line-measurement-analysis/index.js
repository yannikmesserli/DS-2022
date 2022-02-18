// @ts-check
import { ESRI_OFFICE_BSL } from "../scenes.js";
import { initView, onInit } from "../utils.js";

let view, widget;

onInit("direct-line-measurement-analysis", () => {
  view = initView(ESRI_OFFICE_BSL);
});