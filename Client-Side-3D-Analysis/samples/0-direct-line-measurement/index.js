// @ts-check
import DirectLineMeasurement3D from "esri/widgets/DirectLineMeasurement3D.js";
import { initView, onFragment, onInit } from "../utils.js";

let view, widget;

onInit("direct-line-measurement", () => {
  view = initView();
  addWidget();
});

onFragment("set-units", setUnits);

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
