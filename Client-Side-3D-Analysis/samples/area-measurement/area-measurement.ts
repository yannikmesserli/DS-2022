// @ts-check
import AreaMeasurement3D from "@arcgis/core/widgets/AreaMeasurement3D";
import { SAN_FRANCISCO } from "../../../common/scenes";
import { initView, onFragment, onInit } from "../../../common/utils";

let widget: AreaMeasurement3D;

onInit("area-measurement", () => {
  const view = initView(SAN_FRANCISCO);
  widget = new AreaMeasurement3D({ view });
  view.ui.add(widget, "top-right");
});

onFragment("set-units", () => {
  widget.viewModel.unit = "square-kilometers";
  widget.viewModel.unitOptions = ["square-meters", "square-kilometers"];
});
