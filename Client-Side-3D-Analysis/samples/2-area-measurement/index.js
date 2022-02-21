// @ts-check
import AreaMeasurement3D from "esri/widgets/AreaMeasurement3D.js";
import { initView, onInit } from "../utils.js";

let view, widget;

onInit("area-measurement", () => {
  view = initView();
  widget = new AreaMeasurement3D({ view });
  view.ui.add(widget, "top-right");
});
