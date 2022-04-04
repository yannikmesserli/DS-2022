import Map from "@arcgis/core/Map";
import SceneView from "@arcgis/core/views/SceneView";

import "@arcgis/core/assets/esri/themes/light/main.css";

import { setupModifications } from "./01-a-modifications";
import { setupStoreState } from "./01-b-store-state";
import { drawingSVM, setupDrawing } from "./02-a-drawing";
import { setupDrawingSnapping } from "./02-b-snapping";
import { setupExtruding } from "./03-extruding";
import { setupMoveFloors } from "./04-move floors";

import { munichLayer } from "./utilities/layers";

const view = new SceneView({
  container: "viewDiv",
  map: new Map({
    basemap: "satellite",
    ground: "world-elevation",
    layers: [munichLayer],
  }),
  camera: {
    position: { x: 11.60221431, y: 48.13713065, z: 634.40014 },
    heading: 326.97,
    tilt: 59.79,
  },
  qualityProfile: "high",
});

// Store view on the window so we can easily access it for debugging purposes
(window as any).view = view;

setupModifications(view);
setupStoreState();
setupDrawing(view);
setupDrawingSnapping();
setupExtruding(view);
setupMoveFloors(drawingSVM);
