// @ts-check
import SceneView from "@arcgis/core/views/SceneView";
import { SHADOW_CAST } from "../scenes";
import { initView, onInit } from "../utils";

let view: SceneView;

onInit("line-of-sight-analysis", () => {
  view = initView(SHADOW_CAST);
});
