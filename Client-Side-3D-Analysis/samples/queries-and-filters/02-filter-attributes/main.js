// @ts-check

import WebScene from "esri/WebScene.js";
import SceneView from "esri/views/SceneView.js";
import FeatureFilter from "esri/views/layers/support/FeatureFilter.js";
import config from "esri/config.js";
import appConfig from "../helpers/config.js";
import * as renderers from "../helpers/renderers.js";

let view, layer, layerView;

const slideTitle = parent.Reveal.getCurrentSlide().title;

if (slideTitle === "filter-attribute") {
  init();

  const doc = parent.document;
  doc.getElementById("filter-0").onclick = applyYearRenderer;
  doc.getElementById("filter-1").onclick = filter;
  doc.getElementById("filter-2").onclick = removeFilter;
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

function applyYearRenderer() {
  renderers.applyYearRenderer(layer);
}

function filter() {
  view.map.load().then(function () {
    layerView.filter = new FeatureFilter({
      where: `${appConfig.yearField} > 1950`,
    });
  });
}

function removeFilter() {
  view.map.load().then(function () {
    layerView.filter = null;
  });
}
