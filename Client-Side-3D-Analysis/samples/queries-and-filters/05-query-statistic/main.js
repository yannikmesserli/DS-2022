// @ts-nocheck

import WebScene from "esri/WebScene.js";
import SceneView from "esri/views/SceneView.js";
import config from "esri/config.js";
import appConfig from "../helpers/config.js";
import statistics from "../helpers/statistics.js";
import charts from "../helpers/charts.js";
import * as renderers from "../helpers/renderers.js";

let view, layer, layerView;

const slideTitle = parent.Reveal.getCurrentSlide().title;

if (slideTitle === "query-statistic") {
  init();

  const doc = parent.document;
  doc.getElementById("statistic-1").onclick = runSimpleQuery;
  doc.getElementById("statistic-2").onclick = runComplexQuery;
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
    layer = view.map.layers.find(
      (l) => l.title === appConfig.buildingLayerTitle
    );

    // Add all attributes used for querying here to make sure they are loaded!
    layer.outFields = [appConfig.solarAreaField, appConfig.usageField];

    renderers.applySolarAreaRenderer(layer);

    view.whenLayerView(layer).then(function (lV) {
      layerView = lV;
    });
  });
}

function runSimpleQuery() {
  // setup statistic definition
  const avgLabel = "avg_area";
  const statDefinition = [
    {
      onStatisticField: appConfig.solarAreaField,
      outStatisticFieldName: avgLabel,
      statisticType: "avg",
    },
  ];

  // setup UI element
  const avgContainer = document.getElementById("avgContainer");
  avgContainer.style.display = "block";
  avgContainer.style.backgroundColor = "white";
  avgContainer.style.padding = "5px";

  view.ui.add("avgContainer", "top-right");

  // setup query
  const query = layerView.createQuery();
  query.outStatistics = statDefinition;
  query.where = `${appConfig.usageField} = 'industrial'`;

  // run query and display result
  layerView
    .queryFeatures(query)
    .then(function (response) {
      document.getElementById("avg").innerHTML =
        "Average area: " + response.features[0].attributes[avgLabel].toFixed(1);
    })
    .catch(console.error);
}

function runComplexQuery() {
  // show chart
  document.getElementById("statsContainer").style.display = "block";
  view.ui.add("statsContainer", "top-right");

  // setup query
  const query = layerView.createQuery();
  query.outStatistics = statistics.solarAreaStatistics;
  query.where = `${appConfig.usageField} = 'industrial'`;

  // run query and display results
  layerView
    .queryFeatures(query)
    .then(function (response) {
      charts.updateSolarCharts(response);
    })
    .catch(console.error);
}
