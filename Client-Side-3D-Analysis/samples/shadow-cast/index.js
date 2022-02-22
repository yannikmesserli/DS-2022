// @ts-check
import ShadowCast from "@arcgis/core/widgets/ShadowCast.js";
import { SHADOW_CAST } from "../scenes.js";
import { initView, onInit } from "../utils.js";

let view, widget;

onInit("shadow-cast", () => {
  view = initView(SHADOW_CAST);
  view.environment.lighting.directShadowsEnabled = false;

  widget = new ShadowCast({ view });
  view.ui.add(widget, "top-right");
});
