// @ts-check
import DirectLineMeasurement from "esri/analysis/DirectLineMeasurement.js";
import Point from "esri/geometry/Point.js";
import SpatialReference from "esri/geometry/SpatialReference.js";
import { initView, onInit } from "../utils.js";
import { WORLD_CAPITALS } from "../scenes.js";

let view;

// https://zrh-app-sd-2.esri.com/arcgis-play/a/hcampos_zurich/distance-to-city

onInit("direct-line-measurement-analysis", () => {
  view = initView(WORLD_CAPITALS);

  const zurich = new Point({
    x: 8.5417,
    y: 47.3769,
    spatialReference: SpatialReference.WGS84,
  });
  const palmSprings = new Point({
    x: -116.563645,
    y: 33.772349,
    spatialReference: SpatialReference.WGS84,
  });

  const analysis = new DirectLineMeasurement({
    startPoint: zurich,
    endPoint: palmSprings,
  });

  view.analyses.add(analysis);
});
