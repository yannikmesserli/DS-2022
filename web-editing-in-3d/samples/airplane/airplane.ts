import Camera from "@arcgis/core/Camera";
import Point from "@arcgis/core/geometry/Point";
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
      x: 1099535.0699631039,
      y: 5865057.781588203,
      z: 1743.692554133013,
    },
    heading: 30.869375675742816,
    tilt: 77.2140490547386,
  })
);

const airplaneSymbolPromise = new WebStyleSymbol({
  name: "Airplane_Propeller",
  styleName: "EsriRealisticTransportationStyle",
}).fetchSymbol();

let airplanes: GraphicsLayer;
let airplane: Graphic;
let sketchVM: SketchViewModel;

onPlayClick("create", async () => {
  airplanes = new GraphicsLayer({
    elevationInfo: { mode: "relative-to-ground" },
  });
  view.map.add(airplanes);

  const geometry = new Point({
    spatialReference: SpatialReference.WebMercator,
    x: 1099606.5351002163,
    y: 5865177.810734176,
    z: 20,
  });

  airplane = new Graphic({
    geometry,
    symbol: await airplaneSymbolPromise,
  });
  airplanes.add(airplane);

  sketchVM = new SketchViewModel({ view, layer: airplanes });

  sketchVM.update(airplane);
  watchGraphic(view, airplane);
});

onPlayClick("set-absolute-height", () => {
  airplanes.elevationInfo = { mode: "absolute-height" };
  (airplane.geometry as Point).z = 1708;

  sketchVM.update(airplane);
  watchGraphic(view, airplane);
});
