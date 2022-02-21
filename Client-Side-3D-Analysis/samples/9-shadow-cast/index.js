// @ts-check
import ShadowCast from "esri/widgets/ShadowCast.js";
import { SHADOW_CAST } from "../scenes.js";
import { initView, onInit } from "../utils.js";

let view, widget;

onInit("shadow-cast", () => {
  view = initView(SHADOW_CAST);
  widget = new ShadowCast({ view });
  view.ui.add(widget, "top-right");
});
