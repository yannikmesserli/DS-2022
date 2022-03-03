import AreaMeasurement3D from "@arcgis/core/widgets/AreaMeasurement3D";
import { DENVER_PARCELS } from "../../../common/scenes";
import { initView, onPlayClick } from "../../../common/utils";

const view = initView(DENVER_PARCELS);

let widget: AreaMeasurement3D;

onPlayClick("add-widget", () => {
  widget = new AreaMeasurement3D({ view });
  view.ui.add(widget, "top-right");
});

onPlayClick("set-units", () => {
  widget.viewModel.unit = "square-kilometers";
  widget.viewModel.unitOptions = ["square-meters", "square-kilometers"];
});
