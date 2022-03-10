import Map from "@arcgis/core/Map";
import SceneView from "@arcgis/core/views/SceneView";

import "@arcgis/core/assets/esri/themes/light/main.css";

// DEMO STEP
// import { setupModifications } from "./01-a-modifications";

// DEMO STEP
// import { setupStoreState } from "./01-b-store-state";

// DEMO STEP
// import { setupDrawing } from "./02-a-drawing";

// DEMO STEP
// import { setupDrawingSnapping } from "./02-b-snapping";

// DEMO STEP
// import { setupExtruding } from "./03-extruding";

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

// DEMO STEP
// setupModifications(view);

// DEMO STEP
// setupStoreState();

// DEMO STEP
// setupDrawing(view);

// DEMO STEP
// setupDrawingSnapping();

// DEMO STEP
// setupExtruding(view);
