import Slice from "@arcgis/core/widgets/Slice";
import { ESRI_OFFICE_BSL } from "../../../common/scenes";
import { initView, onInit, onPlayClick } from "../../../common/utils";

const view = initView(ESRI_OFFICE_BSL);
let widget: Slice | null = null;

onPlayClick("add-widget", () => {
  widget = new Slice({ view });
  view.ui.add(widget, "top-right");
});

onPlayClick("tilt-enabled", () => {
  if (widget) {
    widget.viewModel.tiltEnabled = true;
  }
});
