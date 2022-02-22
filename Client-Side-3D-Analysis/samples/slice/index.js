// @ts-check
import Slice from "@arcgis/core/widgets/Slice.js";
import { initView, onInit } from "../utils.js";

let view, widget;

onInit("slice", () => {
  view = initView();
  widget = new Slice({ view });
  view.ui.add(widget, "top-right");
});
