// @ts-check

import WebScene from "esri/WebScene.js";
import SceneView from "esri/views/SceneView.js";
import FeatureFilter from "esri/views/layers/support/FeatureFilter.js";
import config from "esri/config.js";
import appConfig from "../helpers/config.js";
import * as time from "../helpers/time.js";

let view, layer, layerView, timeSlider;

const slideTitle = parent.Reveal.getCurrentSlide().title;

if (slideTitle === "timeslider") {
  init();

  const doc = parent.document;
  doc.getElementById("timeslider-1").onclick = addTimeSlider;
  doc.getElementById("timeslider-2").onclick = watchTimeSlider;
}

function init() {
  config.portalUrl = appConfig.portalUrl;

  view = new SceneView({
    map: new WebScene({
      portalItem: { id: appConfig.itemId },
      basemap: "topo",
    }),
    container: "viewDiv",
    qualityProfile: "high",
  });

  view.map.load().then(function () {
    layer = view.map.layers.find(function (l) {
      return l.title === appConfig.buildingLayerTitle;
    });

    // Add all attributes used for filtering here to make sure they are loaded!
    layer.outFields = [appConfig.yearField];

    view.whenLayerView(layer).then(function (lV) {
      layerView = lV;
    });
  });
}

function addTimeSlider() {
  view.map.load().then(function () {
    timeSlider = time.createTimeSlider(view);
  });
}

function watchTimeSlider() {
  timeSlider.watch("timeExtent", function (timeExtent) {
    const maxYear = timeExtent.end.getFullYear();
    layerView.filter = new FeatureFilter({
      where: `${appConfig.yearField} <= ${maxYear}`,
    });
  });
}
