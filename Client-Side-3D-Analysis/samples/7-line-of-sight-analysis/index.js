// @ts-check
import { ESRI_OFFICE_BSL } from "../scenes.js";
import { initView, onInit } from "../utils.js";

let view, widget;

onInit("line-of-sight-analysis", () => {
  view = initView();
});
