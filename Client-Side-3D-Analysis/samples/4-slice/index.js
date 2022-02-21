// @ts-check
import Slice from "esri/widgets/Slice.js";
import { initView, onInit } from "../utils.js";

let view, widget;

onInit("line-of-sight", () => {
  view = initView();
  widget = new Slice({ view });
  view.ui.add(widget, "top-right");
});
