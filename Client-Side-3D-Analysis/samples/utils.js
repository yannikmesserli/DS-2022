// @ts-check
import WebScene from "@arcgis/core/WebScene.js";
import SceneView from "@arcgis/core/views/SceneView.js";
import Fullscreen from "@arcgis/core/widgets/Fullscreen.js";

export function onInit(title, cb) {
  if (parent.Reveal.getCurrentSlide().getAttribute("data-slideId") === title) {
    cb();
  }
}

export function onFragment(id, cb) {
  parent.Reveal.on("fragmentshown", (event) => {
    if (event.fragment.getAttribute("data-fragment-id") === id) {
      cb();
    }
  });
}

export function initView(itemId) {
  const view = new SceneView({
    map: itemId ? new WebScene({ portalItem: { id: itemId } }) : new WebScene({ basemap: "topo" }),
    container: "viewDiv",
    qualityProfile: "medium",
    popup: { defaultPopupTemplateEnabled: false },
  });

  view.ui.add(new Fullscreen({ view }), "bottom-right");

  return view;
}

export function throwIfAborted(signal) {
  if (signal.aborted) {
    throw new Error("AbortError");
  }
}

export function throwIfNotAbortError(e) {
  if (e.message !== "AbortError") {
    throw e;
  }
}
