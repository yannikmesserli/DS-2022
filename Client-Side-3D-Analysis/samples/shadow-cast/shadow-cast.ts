import Daylight from "@arcgis/core/widgets/Daylight";
import ShadowCast from "@arcgis/core/widgets/ShadowCast";
import { SHADOW_CAST } from "../../../common/scenes";
import { addOAuthSupport, initView, onPlayClick } from "../../../common/utils";

addOAuthSupport();

const view = initView(SHADOW_CAST);

let widget: ShadowCast | Daylight | null;

onPlayClick("add-daylight", () => {
  removeWidget();

  widget = new Daylight({ view });
  view.ui.add(widget, "top-right");

  setDirectShadows(true);
});

onPlayClick("add-shadow-cast", () => {
  removeWidget();

  widget = new ShadowCast({ view });
  view.ui.add(widget, "top-right");

  // Show only accumulated shadows, for easier analysis.
  setDirectShadows(false);
});

function setDirectShadows(value: boolean): void {
  view.environment.lighting!.directShadowsEnabled = value;
}

function removeWidget(): void {
  if (widget) {
    view.ui.remove(widget);
    widget.destroy();
    widget = null;
  }
}
