// @ts-check
import Slice from "@arcgis/core/widgets/Slice.js";
import { ESRI_OFFICE_BSL } from "../scenes.js";
import { initView, onInit } from "../utils.js";

let view, widget;

onInit("slice", () => {
  view = initView(ESRI_OFFICE_BSL);
  widget = new Slice({ view });
  view.ui.add(widget, "top-right");
});
