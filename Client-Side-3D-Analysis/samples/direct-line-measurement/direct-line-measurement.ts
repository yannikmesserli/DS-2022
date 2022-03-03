// @ts-check
import SceneView from "@arcgis/core/views/SceneView";
import DirectLineMeasurement3D from "@arcgis/core/widgets/DirectLineMeasurement3D";
import { SAN_FRANCISCO } from "../../../common/scenes";
import { initView, onPlayClick } from "../../../common/utils";

const view = initView(SAN_FRANCISCO);

let widget: DirectLineMeasurement3D;

onPlayClick("add-widget", () => {
  widget = new DirectLineMeasurement3D({ view: view });
  view.ui.add(widget, "top-right");
});

onPlayClick("set-units", () => {
  widget.viewModel.unit = "kilometers";
  widget.viewModel.unitOptions = ["meters", "kilometers"];
});
