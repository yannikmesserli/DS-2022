import LineOfSight from "@arcgis/core/widgets/LineOfSight";
import { MUNICH } from "../../../common/scenes";
import { initView, onPlayClick } from "../../../common/utils";

const view = initView(MUNICH);

let widget: LineOfSight;

onPlayClick("add-widget", () => {
  widget = new LineOfSight({ view });
  view.ui.add(widget, "top-right");
});
