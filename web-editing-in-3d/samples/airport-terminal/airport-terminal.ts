import Camera from "@arcgis/core/Camera";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import SolidEdges3D from "@arcgis/core/symbols/edges/SolidEdges3D";
import ExtrudeSymbol3DLayer from "@arcgis/core/symbols/ExtrudeSymbol3DLayer";
import PolygonSymbol3D from "@arcgis/core/symbols/PolygonSymbol3D";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import { SAMEDAN_AIRPORT } from "../../../common/scenes";
import { initView, onPlayClick } from "../../../common/utils";
import { watchGraphic } from "../utils";

const view = initView(
  SAMEDAN_AIRPORT,
  new Camera({
    position: {
      spatialReference: SpatialReference.WebMercator,
      x: 1099993.5949158794,
      y: 5865684.589934241,
      z: 1982.2895089341328,
    },
    heading: 300.363239318732,
    tilt: 25.4903384824162,
  })
);

let terminals = new GraphicsLayer({
  elevationInfo: { mode: "absolute-height" },
});
view.map.add(terminals);

let sketchVM = new SketchViewModel({
  view,
  layer: terminals,
});

sketchVM.on("create", (event) => {
  if (event.state === "complete") {
    const graphic = event.graphic;
    sketchVM.update(graphic);
    watchGraphic(view, graphic);
  }
});

onPlayClick("create", async () => {
  sketchVM.polygonSymbol = new PolygonSymbol3D({
    symbolLayers: [
      new ExtrudeSymbol3DLayer({
        size: 10,
        material: { color: [255, 255, 255, 1] },
        edges: new SolidEdges3D({
          size: 1,
          color: [0, 0, 0, 1],
        }),
      }),
    ],
  });
  sketchVM.create("polygon");
});

onPlayClick("enable-snapping", async () => {
  const opts = sketchVM.snappingOptions;
  opts.enabled = true;
  opts.featureSources = [{ layer: terminals }] as any;
});

onPlayClick("enable-edge-offset", async () => {
  const reshapeOptions = sketchVM.defaultUpdateOptions.reshapeOptions;
  reshapeOptions!.edgeOperation = "offset";
});
