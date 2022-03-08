import Camera from "@arcgis/core/Camera";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import Graphic from "@arcgis/core/Graphic";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import WebStyleSymbol from "@arcgis/core/symbols/WebStyleSymbol";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import { SAMEDAN_AIRPORT } from "../../../common/scenes";
import { initView, onPlayClick } from "../../../common/utils";
import { watchGraphic } from "../utils";

const view = initView(
  SAMEDAN_AIRPORT,
  new Camera({
    position: {
      spatialReference: SpatialReference.WebMercator,
      x: 1099820.528361645,
      y: 5865792.376922636,
      z: 1736.2411283198744,
    },
    heading: 320.6680886902018,
    tilt: 71.8256269429896,
  })
);

const antennaSymbolPromise = new WebStyleSymbol({
  name: "Cell_Phone_Antenna",
  styleName: "EsriInfrastructureStyle",
}).fetchSymbol();

let antennas: GraphicsLayer;
let antenna: Graphic;
let sketchVM: SketchViewModel;

onPlayClick("create-point", async () => {
  antennas = new GraphicsLayer({
    elevationInfo: { mode: "on-the-ground" },
  });
  view.map.add(antennas);

  sketchVM = new SketchViewModel({
    view,
    layer: antennas,
    pointSymbol: await antennaSymbolPromise,
  });

  sketchVM.on("create", (event) => {
    if (event.state === "complete") {
      antenna = event.graphic;
      sketchVM.update(antenna);
      watchGraphic(view, antenna);
    }
  });

  sketchVM.create("point");
});

onPlayClick("set-relative-to-scene", () => {
  antennas.elevationInfo = { mode: "relative-to-scene" };
  sketchVM.update(antenna);
  watchGraphic(view, antenna);
});
