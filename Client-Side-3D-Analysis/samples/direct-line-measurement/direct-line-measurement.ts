// @ts-check
import SceneView from "@arcgis/core/views/SceneView";
import DirectLineMeasurement3D from "@arcgis/core/widgets/DirectLineMeasurement3D";
import { initView, onFragment, onInit } from "../utils";

let view: SceneView;
let widget: DirectLineMeasurement3D;

onInit("direct-line-measurement", () => {
  view = initView();
  widget = new DirectLineMeasurement3D({ view: view });
  view.ui.add(widget, "top-right");
});

onFragment("set-units", () => {
  widget.viewModel.unit = "kilometers";
  widget.viewModel.unitOptions = ["meters", "kilometers"];
});

console.log("test");
