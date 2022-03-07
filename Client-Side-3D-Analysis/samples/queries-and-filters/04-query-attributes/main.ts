// @ts-nocheck

import WebScene from "@arcgis/core/WebScene";
import SceneView from "@arcgis/core/views/SceneView";
import config from "@arcgis/core/config";
import appConfig from "../helpers/config";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";
import * as renderers from "../helpers/renderers";

let view, layer, layerView;

const slideTitle = parent.Reveal ? parent.Reveal.getCurrentSlide().title : null;

if (slideTitle == null) {
  init();
}

if (slideTitle === "query-attribute") {
  init();

  const doc = parent.document;
  doc.getElementById("query-1").onclick = queryFeatures(appConfig.addressField);
  doc.getElementById("query-2").onclick = queryObjectIds;

  doc.getElementById("query-3").onclick = queryFeatures(appConfig.usageField);
  doc.getElementById("query-4").onclick = queryFeatures(appConfig.usageField, true);
}

function init() {
  config.portalUrl = appConfig.portalUrl;

  const graphicsLayer = new GraphicsLayer({
    // elevationInfo: { mode: "on-the-ground" },
    title: "Sketch GraphicsLayer",
  });

  const point = {
    type: "point", // autocasts as new Point()
    spatialReference: { latestWkid: 3857, wkid: 102100 },
    x: 2775690.9496367406,
    y: 8434900.987816326,
    z: 10,
  };

  const markerSymbol = {
    type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
    color: [226, 119, 40],
    outline: {
      // autocasts as new SimpleLineSymbol()
      color: [255, 255, 255],
      width: 2,
    },
  };

  const pointGraphic = new Graphic({
    geometry: point,
    symbol: markerSymbol,
  });

  graphicsLayer.add(pointGraphic);

  view = new SceneView({
    map: new WebScene({
      portalItem: { id: appConfig.itemId },
      basemap: "topo",
    }),
    container: "viewDiv",
    qualityProfile: "high",
  });

  view.map.layers.add(graphicsLayer);

  view.ui.add("statsContainer", "top-right");

  view.map.load().then(function () {
    layer = view.map.layers.find((l) => l.title === appConfig.buildingLayerTitle);

    // Add all attributes used for querying here to make sure they are loaded!
    layer.outFields = [appConfig.solarAreaField, appConfig.addressField, appConfig.usageField];

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
