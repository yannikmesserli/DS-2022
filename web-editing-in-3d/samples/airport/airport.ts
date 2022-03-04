import Camera from "@arcgis/core/Camera";
import Collection from "@arcgis/core/core/Collection";
import { Point } from "@arcgis/core/geometry";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import Graphic from "@arcgis/core/Graphic";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import ExtrudeSymbol3DLayer from "@arcgis/core/symbols/ExtrudeSymbol3DLayer";
import PolygonSymbol3D from "@arcgis/core/symbols/PolygonSymbol3D";
import WebStyleSymbol from "@arcgis/core/symbols/WebStyleSymbol";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import "@esri/calcite-components";
import "@esri/calcite-components/dist/components/calcite-button";
import { SAMEDAN_AIRPORT } from "../../../common/scenes";
import { initView, onInit, onPlayClick } from "../../../common/utils";

const view = ((window as any)["view"] = initView(SAMEDAN_AIRPORT));

const treeSymbolPromise = new WebStyleSymbol({
  name: "Larix",
  styleName: "EsriRealisticTreesStyle",
}).fetchSymbol();

const airplaneSymbolPromise = new WebStyleSymbol({
  name: "Airplane_Propeller",
  styleName: "EsriRealisticTransportationStyle",
}).fetchSymbol();

const terminalSymbol = new PolygonSymbol3D({
  symbolLayers: [
    new ExtrudeSymbol3DLayer({
      size: 5,
      material: { color: [255, 255, 255, 1] },
    }),
  ],
});

const trees = new GraphicsLayer({ elevationInfo: { mode: "on-the-ground" } });
const airplanes = new GraphicsLayer({ elevationInfo: { mode: "relative-to-ground" } });
const antennas = new GraphicsLayer({ elevationInfo: { mode: "relative-to-scene" } });
const terminals = new GraphicsLayer({ elevationInfo: { mode: "absolute-height" } });
view.map.addMany([trees, airplanes, antennas, terminals]);

onInit("place-tree", () => {
  view.camera = new Camera({
    position: {
      spatialReference: SpatialReference.WebMercator,
      x: 1099547.5896370823,
      y: 5865784.810745756,
      z: 1721.5289201699197,
    },
    heading: 81.67617671105981,
    tilt: 81.39865815504064,
  });

  let tree: Graphic;
  let svm: SketchViewModel;

  onPlayClick("place-point", () => {
    const geometry = new Point({
      spatialReference: SpatialReference.WebMercator,
      x: 1099669.010918441,
      y: 5865797.66212949,
      z: 1704.4597652583454,
    });

    tree = new Graphic({ geometry });
    trees.add(tree);
  });

  onPlayClick("set-tree-symbol", async () => {
    tree.symbol = await treeSymbolPromise;
  });

  onPlayClick("update-tree", () => {
    const svm = new SketchViewModel({
      view,
      layer: trees,
    });

    svm.update(tree);
  });
});

view.on("click", (e) => {
  console.log(e.mapPoint);
});

onPlayClick("relative-to-ground", async () => {
  view.camera = new Camera({
    position: {
      spatialReference: SpatialReference.WebMercator,
      x: 1099838.309838232,
      y: 5865770.443455763,
      z: 1771.2705388450995,
    },
    heading: 327.12912283465096,
    tilt: 46.776661717554724,
  });
});

onPlayClick("relative-to-scene", async () => {
  view.camera = new Camera({
    position: {
      spatialReference: SpatialReference.WebMercator,
      x: 1099820.528361645,
      y: 5865792.376922636,
      z: 1736.2411283198744,
    },
    heading: 320.6680886902018,
    tilt: 71.8256269429896,
  });
});

onPlayClick("polygons-click", async () => {
  view.camera = new Camera({
    position: {
      spatialReference: SpatialReference.WebMercator,
      x: 1099908.0674983682,
      y: 5865746.7213742165,
      z: 1933.7259117281064,
    },
    heading: 300.36268172986865,
    tilt: 25.490546411744187,
  });
});

// function enableSnapping(): void {
//   svm.snappingOptions.enabled = true;
//   svm.snappingOptions.distance = 15;
//   svm.snappingOptions.featureSources = new Collection([{ layer: terminals } as any]);
// }
