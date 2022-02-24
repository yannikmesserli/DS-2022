// @ts-check
import AreaMeasurement3D from "@arcgis/core/widgets/AreaMeasurement3D.js";
import { initView, onFragment, onInit } from "../utils.js";

let view, widget;

onInit("area-measurement", () => {
  view = initView();
  widget = new AreaMeasurement3D({ view });
  view.ui.add(widget, "top-right");
});

onFragment("set-units", () => {
  widget.viewModel.unit = "square-kilometers";
  widget.viewModel.unitOptions = ["square-meters", "square-kilometers"];
});
