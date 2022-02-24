// @ts-check
import SceneView from "@arcgis/core/views/SceneView";
import ShadowCast from "@arcgis/core/widgets/ShadowCast";
import { SHADOW_CAST } from "../../../common/scenes";
import { initView, onInit } from "../../../common/utils";

let view: SceneView;
let widget: ShadowCast;

onInit("shadow-cast", () => {
  view = initView(SHADOW_CAST);
  view.environment.lighting!.directShadowsEnabled = false;

  widget = new ShadowCast({ view });
  view.ui.add(widget, "top-right");
});
