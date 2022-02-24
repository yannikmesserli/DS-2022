// @ts-check
import DirectLineMeasurement3D from "@arcgis/core/widgets/DirectLineMeasurement3D";
import { initView, onFragment, onInit } from "../utils.js";

let view, widget;

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