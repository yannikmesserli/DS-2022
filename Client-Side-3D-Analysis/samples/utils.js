import WebScene from "esri/WebScene.js";
import SceneView from "esri/views/SceneView.js";
import Fullscreen from "esri/widgets/Fullscreen.js";

export function onInit(title, cb) {
  if (parent.Reveal.getCurrentSlide().getAttribute("data-slideId") === title) {
    cb();
  }
}

export function initView(itemId) {
  const view = new SceneView({
    map: new WebScene({ portalItem: { id: itemId } }),
    container: "viewDiv",
    qualityProfile: "medium",
    popup: {
      defaultPopupTemplateEnabled: false
    }
  });

  view.ui.add(new Fullscreen({ view }), "bottom-right");

  return view;
}