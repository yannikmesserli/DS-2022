import { intersects } from "@arcgis/core/geometry/geometryEngine";
import Point from "@arcgis/core/geometry/Point";
import Polygon from "@arcgis/core/geometry/Polygon";
import Graphic from "@arcgis/core/Graphic";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import IntegratedMeshLayer from "@arcgis/core/layers/IntegratedMeshLayer";
import SceneModification from "@arcgis/core/layers/support/SceneModification";
import SceneModifications from "@arcgis/core/layers/support/SceneModifications";
import Map from "@arcgis/core/Map";
import SolidEdges3D from "@arcgis/core/symbols/edges/SolidEdges3D";
import ExtrudeSymbol3DLayer from "@arcgis/core/symbols/ExtrudeSymbol3DLayer";
import FillSymbol3DLayer from "@arcgis/core/symbols/FillSymbol3DLayer";
import ObjectSymbol3DLayer from "@arcgis/core/symbols/ObjectSymbol3DLayer";
import PointSymbol3D from "@arcgis/core/symbols/PointSymbol3D";
import PolygonSymbol3D from "@arcgis/core/symbols/PolygonSymbol3D";
import SceneView from "@arcgis/core/views/SceneView";
import Fullscreen from "@arcgis/core/widgets/Fullscreen";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";

import "@esri/calcite-components";
import "@esri/calcite-components/dist/components/calcite-action";
import "@esri/calcite-components/dist/components/calcite-action-bar";

const im = new IntegratedMeshLayer({
  portalItem: { id: "7a4ce32df4774997bbb32f230efbe7cc" },
});

const view = new SceneView({
  container: "viewDiv",
  map: new Map({
    basemap: "topo",
    ground: "world-elevation",
    layers: [im],
  }),
  camera: {
    position: { x: 11.60221431, y: 48.13713065, z: 634.40014 },
    heading: 326.97,
    tilt: 59.79,
  },
  qualityProfile: "high",
});

view.ui.add(new Fullscreen({ view }), "bottom-right");

const maskLayer = new GraphicsLayer();
view.map.add(maskLayer);

const maskSVM = new SketchViewModel({
  view,
  layer: maskLayer,
  defaultUpdateOptions: {
    tool: "reshape",
    reshapeOptions: { edgeOperation: "offset" },
  },
  polygonSymbol: new PolygonSymbol3D({
    symbolLayers: [
      new FillSymbol3DLayer({
        outline: {
          size: "2px",
          color: "white",
        },
      }),
    ],
  }),
});

maskSVM.on("create", (event) => {
  if (event.state === "start") {
    im.modifications?.removeAll();
    maskLayer.removeAll();
  }

  if (event.state === "complete") {
    updateMasking(event.graphic);
  }
});

maskSVM.on("update", (event) => {
  if (event.state === "complete") {
    updateMasking(event.graphics[0]);
  }
});

function updateMasking(graphic: Graphic): void {
  if (!im.modifications) {
    im.modifications = new SceneModifications();
  }

  const geometry = graphic?.geometry as Polygon;
  const existing = im.modifications.getItemAt(0);

  if (existing) {
    im.modifications.remove(existing);
  }

  if (geometry && geometry.type === "polygon" && geometry.rings.length > 0 && geometry.rings[0].length > 2) {
    im.modifications.add(
      new SceneModification({
        geometry,
        type: "replace",
      })
    );
  }
}

function actionMasking(): void {
  maskSVM.create("polygon");
}

const buildingLayer = new GraphicsLayer();
view.map.add(buildingLayer);

const floorSymbol = new PolygonSymbol3D({
  symbolLayers: [
    new ExtrudeSymbol3DLayer({
      material: { color: [100, 130, 180] },
      edges: new SolidEdges3D({ size: "1px", color: [50, 50, 50] }),
      size: 3,
    }),
  ],
});

const drawingSVM = new SketchViewModel({
  view,
  layer: buildingLayer,
  polygonSymbol: floorSymbol,
  defaultUpdateOptions: {
    tool: "reshape",
    reshapeOptions: { edgeOperation: "offset" },
  },
  snappingOptions: {
    featureSources: [{ layer: buildingLayer } as any],
    enabled: true,
  },
});

function actionDrawBuilding(): void {
  drawingSVM.create("polygon");
}

const selectedFloorSymbol = new PolygonSymbol3D({
  symbolLayers: [
    new ExtrudeSymbol3DLayer({
      material: { color: [100, 130, 180] },
      edges: new SolidEdges3D({ size: "1px", color: [255, 255, 255] }),
      size: 3,
    }),
  ],
});

let selectedFloor: Graphic | null = null;

const extrudeLayer = new GraphicsLayer();
view.map.add(extrudeLayer);

const extrudeSVM = new SketchViewModel({
  view,
  layer: extrudeLayer,
  defaultUpdateOptions: {
    enableRotation: false,
    enableScaling: false,
    tool: "move",
  },
});

function actionExtrudeBuilding(): void {
  const pointerMoveHandle = view.on("pointer-move", async (ev) => {
    const { results } = await view.hitTest(ev);

    const floorGraphic = results[0]?.graphic;

    if (floorGraphic === selectedFloor) {
      return;
    }

    if (selectedFloor) {
      selectedFloor.symbol = floorSymbol;
    }

    selectedFloor = floorGraphic;

    if (selectedFloor) {
      selectedFloor.symbol = selectedFloorSymbol;
    }
  });

  const pointerDownHandle = view.on("immediate-click", (ev) => {
    pointerMoveHandle.remove();
    pointerDownHandle.remove();

    if (!selectedFloor) {
      return;
    }

    selectedFloor.symbol = floorSymbol;

    ev.stopPropagation();

    const centroid = (selectedFloor.geometry as Polygon).centroid.clone();
    centroid.z += 3;

    const handleGraphic = new Graphic({
      geometry: centroid,
      symbol: new PointSymbol3D({
        symbolLayers: [
          new ObjectSymbol3DLayer({
            resource: { primitive: "cylinder" },
            height: 0.5,
            width: 3,
            depth: 3,
            material: { color: "orange" },
          }),
        ],
      }),
    });

    extrudeLayer.add(handleGraphic);
    extrudeSVM.update(handleGraphic);
  });
}

let extrudedFloors: Graphic[] = [];

extrudeSVM.on("update", (ev) => {
  if (ev.state === "complete") {
    extrudeLayer.removeAll();
    extrudedFloors.length = 0;
    return;
  }

  if (!selectedFloor) {
    return;
  }

  const originalZ = (selectedFloor.geometry as Polygon)?.rings[0][0][2];
  const z = (ev.graphics[0].geometry as Point).z;

  const numFloors = Math.max(0, Math.floor((z - originalZ) / 3) - 1);

  if (numFloors < extrudedFloors.length) {
    buildingLayer.removeMany(extrudedFloors.slice(numFloors));
    extrudedFloors.length = numFloors;
  }

  let floorIndex = extrudedFloors.length + 1;

  while (extrudedFloors.length < numFloors) {
    const newFloor = selectedFloor.geometry.clone() as Polygon;
    const ring = newFloor.rings[0];

    for (const coordinate of ring) {
      coordinate[2] = originalZ + floorIndex * 3;
    }

    const newGraphic = new Graphic({ geometry: newFloor, symbol: floorSymbol });
    extrudedFloors.push(newGraphic);
    buildingLayer.add(newGraphic);

    floorIndex++;
  }
});

let moveFloors: { graphic: Graphic; geometry: Polygon }[] = [];
let originalFirstVertex: number[] = [];

drawingSVM.on("update", (ev) => {
  const type = ev.toolEventInfo?.type;

  if (type !== "move" && type !== "move-start" && type !== "move-stop") {
    return;
  }

  const graphic = ev.graphics[0];
  const polygon = graphic.geometry as Polygon;

  if (type === "move-start") {
    moveFloors = buildingLayer.graphics
      .filter((floor) => {
        return !ev.graphics.includes(floor) && intersects(polygon, floor.geometry);
      })
      .toArray()
      .map((graphic) => ({ graphic, geometry: graphic.geometry.clone() as Polygon }));

    originalFirstVertex = polygon.rings[0][0].slice();
  }

  const deltaX = polygon.rings[0][0][0] - originalFirstVertex[0];
  const deltaY = polygon.rings[0][0][1] - originalFirstVertex[1];

  for (const floor of moveFloors) {
    const geometry = (floor.geometry as Polygon).clone();
    for (const coordinate of geometry.rings[0]) {
      coordinate[0] += deltaX;
      coordinate[1] += deltaY;
    }
    floor.graphic.geometry = geometry;
  }
});

document.getElementById("action-masking")!.addEventListener("click", actionMasking);
document.getElementById("action-draw-building")!.addEventListener("click", actionDrawBuilding);
document.getElementById("action-extrude-building")!.addEventListener("click", actionExtrudeBuilding);
