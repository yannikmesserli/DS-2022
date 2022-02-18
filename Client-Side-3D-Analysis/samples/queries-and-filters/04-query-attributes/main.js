// @ts-nocheck

import WebScene from "esri/WebScene.js";
import SceneView from "esri/views/SceneView.js";
import config from "esri/config.js";
import appConfig from "../helpers/config.js";
import * as renderers from "../helpers/renderers.js";

let view, layer, layerView;

const slideTitle = parent.Reveal.getCurrentSlide().title;

if (slideTitle === "query-attribute") {
  init();

  const doc = parent.document;
  doc.getElementById("query-1").onclick = queryFeatures(appConfig.addressField);
  doc.getElementById("query-2").onclick = queryObjectIds;

  doc.getElementById("query-3").onclick = queryFeatures(appConfig.usageField);
  doc.getElementById("query-4").onclick = queryFeatures(
    appConfig.usageField,
    true
  );
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

  view.ui.add("statsContainer", "top-right");

  view.map.load().then(function () {
    layer = view.map.layers.find(
      (l) => l.title === appConfig.buildingLayerTitle
    );

    // Add all attributes used for querying here to make sure they are loaded!
    layer.outFields = [
      appConfig.solarAreaField,
      appConfig.addressField,
      appConfig.usageField,
    ];

    renderers.applySolarAreaRenderer(layer);

    view.whenLayerView(layer).then(function (lV) {
      layerView = lV;
    });
  });
}

function queryFeatures(attributeName, distinct = false) {
  return () => {
    const query = layerView.createQuery();
    query.where = `${appConfig.solarAreaField} BETWEEN 400 AND 500`;

    query.outFields = [attributeName];
    query.returnDistinctValues = distinct;

    layerView.queryFeatures(query).then(function (response) {
      document.getElementById("statsContainer").style.display = "block";
      const list = document.getElementById("resultList");
      list.innerHTML = "";

      response.features.forEach(function (entry) {
        list.innerHTML += "<div>" + entry.attributes[attributeName] + "</div>";
      });
    });
  };
}

let highlightHandle;
function queryObjectIds() {
  const query = layerView.createQuery();
  query.where = `${appConfig.solarAreaField} BETWEEN 400 AND 500`;

  layerView.queryObjectIds(query).then(function (response) {
    highlightHandle = layerView.highlight(response);
  });
}

function turnHighlightOff() {
  highlightHandle.remove();
}
