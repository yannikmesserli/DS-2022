import { watch } from "@arcgis/core/core/reactiveUtils";
import Point from "@arcgis/core/geometry/Point";
import Graphic from "@arcgis/core/Graphic";
import SceneView from "@arcgis/core/views/SceneView";

let widget: HTMLElement | null = null;

export function watchGraphic(view: SceneView, g: Graphic): void {
  if (widget) {
    view.ui.remove(widget);
  }

  widget = document.createElement("div");
  widget.className = "esri-widget";
  widget.style.padding = "10px";
  widget.style.fontSize = "2.5rem";
  view.ui.add(widget, "top-right");

  watch(
    () => g.geometry,
    (geometry) => {
      if (!(geometry instanceof Point) || !widget) {
        return;
      }

      const { x, y, z } = geometry;

      widget.textContent = `X: ${x.toFixed(2)} | Y: ${y.toFixed(2)} | Z: ${
        z === undefined ? "-" : z.toFixed(2)
      }`;
    },
    { initial: true, sync: true }
  );
}
