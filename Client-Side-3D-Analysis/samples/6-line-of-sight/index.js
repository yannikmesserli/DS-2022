// @ts-check
import LineOfSight from "esri/widgets/LineOfSight.js";
import { initView, onInit } from "../utils.js";

let view, widget;

onInit("line-of-sight", () => {
  view = initView();
  widget = new LineOfSight({ view });
  view.ui.add(widget, "top-right");
});
