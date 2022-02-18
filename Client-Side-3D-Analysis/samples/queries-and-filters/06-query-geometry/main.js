// @ts-nocheck

import WebScene from "esri/WebScene.js";
import SceneView from "esri/views/SceneView.js";
import Sketch from "esri/widgets/Sketch.js";
import GraphicsLayer from "esri/layers/GraphicsLayer.js";
import * as promiseUtils from "esri/core/promiseUtils.js";
import config from "esri/config.js";
import appConfig from "../helpers/config.js";
import * as renderers from "../helpers/renderers.js";

let view, layer, layerView, sketch, geometry, filtering, highlightHandle;

const slideTitle = parent.Reveal.getCurrentSlide().title;

if (slideTitle === "spatial") {
  init();

  const doc = parent.document;
  doc.getElementById("spatial-1").onclick = switchToQueryMode;
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
    layer.outFields = [appConfig.usageField];

    renderers.applyUsageRenderer(layer);

    view.whenLayerView(layer).then(function (lV) {
      layerView = lV;
      layerView.filter = {}; // initialize empty filter object
    });
  });

  // Add graphics layer for sketch
  const sketchLayer = new GraphicsLayer({
    elevationInfo: { mode: "on-the-ground" },
  });
  view.map.add(sketchLayer);

  // Add sketch widget
  sketch = new Sketch({
    layer: sketchLayer,
    view: view,
    creationMode: "update", // immediately select created geometry
  });

  // Initially we are in filtering mode (geometry is applied as filter)
  filtering = true;

  // Watch geometry creation
  sketch.on("create", function (event) {
    if (event.state === "complete") {
      geometry = event.graphic.geometry;

      if (filtering) {
        layerView.filter.geometry = geometry;
        layerView.filter.spatialRelationship = "contains";
      } else {
        query();
      }
    }
  });

  // Watch geometry change (move/reshape)
  sketch.on("update", function (event) {
    if (!event.cancelled && event.graphics.length) {
      geometry = event.graphics[0].geometry;

      if (filtering) {
        layerView.filter.geometry = geometry;
        layerView.filter.spatialRelationship = "contains";
      } else {
        query();
      }
    }
  });

  view.ui.add(sketch, "top-right");
}

// Stop filtering by geometry, start querying and highlighting objectIDs instead
function switchToQueryMode() {
  filtering = false;
  layerView.filter = null;

  query();
}

function query() {
  const query = layerView.createQuery();

  query.geometry = geometry;
  query.distance = 100;
  query.units = "meters";
  query.spatialRelationship = "contains";

  query.where = `${appConfig.usageField} = 'residential'`;

  // Use debounce to avoid input lag while queries are running
  const debouncedQuery = promiseUtils.debounce(function () {
    return layerView
      .queryObjectIds(query)
      .then(function (response) {
        // Make sure to clear existing highlights before adding a new one
        if (highlightHandle) {
          highlightHandle.remove();
        }
        // Run the query
        highlightHandle = layerView.highlight(response);
      })
      .catch(console.error);
  });
  debouncedQuery();
}
