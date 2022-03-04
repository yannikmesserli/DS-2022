import Camera from "@arcgis/core/Camera";
import { Point } from "@arcgis/core/geometry";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import Graphic from "@arcgis/core/Graphic";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import WebStyleSymbol from "@arcgis/core/symbols/WebStyleSymbol";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import { SAMEDAN_AIRPORT } from "../../../common/scenes";
import { initView, onInit, onPlayClick } from "../../../common/utils";
import { watchGraphic } from "../utils";

const view = initView(SAMEDAN_AIRPORT);
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

const treeSymbolPromise = new WebStyleSymbol({
  name: "Larix",
  styleName: "EsriRealisticTreesStyle",
}).fetchSymbol();

let trees: GraphicsLayer;
let tree: Graphic;

onPlayClick("place-point", placeTree);
onPlayClick("set-tree-symbol", setSymbol);
onPlayClick("update-tree", updateTree);

onInit("tree-editable", () => {
  placeTree();
  setSymbol();
});

function placeTree(): void {
  trees = new GraphicsLayer({
    elevationInfo: { mode: "on-the-ground" },
  });
  view.map.add(trees);

  const geometry = new Point({
    spatialReference: SpatialReference.WebMercator,
    x: 1099669.010918441,
    y: 5865797.66212949,
  });

  tree = new Graphic({ geometry });
  trees.add(tree);
}

async function setSymbol(): Promise<void> {
  tree.symbol = await treeSymbolPromise;
}

function updateTree(): void {
  const sketchVM = new SketchViewModel({
    view,
    layer: trees,
  });

  sketchVM.update(tree);
  watchGraphic(view, tree);
}
