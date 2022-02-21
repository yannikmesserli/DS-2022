import WebScene from "esri/WebScene.js";
import SceneView from "esri/views/SceneView.js";
import Fullscreen from "esri/widgets/Fullscreen.js";

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
    map: itemId
      ? new WebScene({ portalItem: { id: itemId } })
      : new WebScene({ basemap: "topo" }),
    container: "viewDiv",
    qualityProfile: "medium",
    popup: { defaultPopupTemplateEnabled: false },
  });

  view.ui.add(new Fullscreen({ view }), "bottom-right");

  return view;
}
