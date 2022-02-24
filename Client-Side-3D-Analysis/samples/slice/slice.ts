// @ts-check
import SceneView from "@arcgis/core/views/SceneView";
import Slice from "@arcgis/core/widgets/Slice";
import { ESRI_OFFICE_BSL } from "../scenes";
import { initView, onInit } from "../utils";

let view: SceneView;
let widget: Slice;

onInit("slice", () => {
  view = initView(ESRI_OFFICE_BSL);
  widget = new Slice({ view });
  view.ui.add(widget, "top-right");
});
