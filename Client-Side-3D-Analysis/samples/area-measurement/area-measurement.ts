// @ts-check
import SceneView from "@arcgis/core/views/SceneView";
import AreaMeasurement3D from "@arcgis/core/widgets/AreaMeasurement3D";
import { initView, onFragment, onInit } from "../utils";

let view: SceneView;
let widget: AreaMeasurement3D;

onInit("area-measurement", () => {
  view = initView();
  widget = new AreaMeasurement3D({ view });
  view.ui.add(widget, "top-right");
});

onFragment("set-units", () => {
  widget.viewModel.unit = "square-kilometers";
  widget.viewModel.unitOptions = ["square-meters", "square-kilometers"];
});
