// @ts-check
import SceneView from "@arcgis/core/views/SceneView";
import LineOfSight from "@arcgis/core/widgets/LineOfSight";
import { SHADOW_CAST } from "../scenes";
import { initView, onInit } from "../utils";

let view: SceneView;
let widget: LineOfSight;

onInit("line-of-sight", () => {
  view = initView(SHADOW_CAST);
  widget = new LineOfSight({ view });
  view.ui.add(widget, "top-right");
});