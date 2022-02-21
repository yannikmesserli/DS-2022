// @ts-check
import LineOfSight from "esri/widgets/LineOfSight.js";
import { SHADOW_CAST } from "../scenes.js";
import { initView, onInit } from "../utils.js";

let view, widget;

onInit("line-of-sight", () => {
  view = initView(SHADOW_CAST);
  widget = new LineOfSight({ view });
  view.ui.add(widget, "top-right");
});
