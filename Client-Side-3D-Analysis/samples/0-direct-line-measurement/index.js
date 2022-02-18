// @ts-check
import DirectLineMeasurement3D from "esri/widgets/DirectLineMeasurement3D.js";
import { ESRI_OFFICE_BSL } from "../scenes.js";
import { initView, onInit } from "../utils.js";

let view, widget;

onInit("direct-line-measurement", () => {
  view = initView(ESRI_OFFICE_BSL);
});

/**
 * Creates a new DirectLineMeasurement3D widget and adds it to the view.
 */
function addWidget() {
  widget = new DirectLineMeasurement3D({ view: view });
  view.ui.add(widget, "top-right");
}

/**
 * Set "proper" units on the widget
 */
function setUnits() {
  // Measure in kilometers.
  widget.viewModel.unit = "kilometers";
  // Only allow selecting certain units.
  widget.viewModel.unitOptions = ["meters", "kilometers"];
}