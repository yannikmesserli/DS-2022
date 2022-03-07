import Graphic from "@arcgis/core/Graphic";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import SceneLayer from "@arcgis/core/layers/SceneLayer";
import SceneLayerView from "@arcgis/core/views/layers/SceneLayerView";
import { HELSINKI, HELSINKI_BUILDING_NAME, HELSINKI_FIELDS } from "./scenes";
import {
  addOAuthSupport,
  applySolarAreaRenderer,
  getLayerFromView,
  initView,
  onPlayClick,
} from "./utils";
import Geometry from "@arcgis/core/geometry/Geometry";

addOAuthSupport();

const view = initView(HELSINKI);
view.popup.defaultPopupTemplateEnabled = true;

getLayerFromView(HELSINKI_BUILDING_NAME, view).then((layer) => {
  layer.outFields = [HELSINKI_FIELDS.solarAreaField];
  applySolarAreaRenderer(layer);
});

const graphicsLayer = new GraphicsLayer({
  // elevationInfo: { mode: "on-the-ground" },
  title: "Sketch GraphicsLayer",
});
const point = {
  type: "point", // autocasts as new Point()
  spatialReference: { latestWkid: 3857, wkid: 102100 },
  x: 2775690.9496367406,
  y: 8434900.987816326,
  z: 50,
};
const markerSymbol = {
  type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
  color: [226, 119, 40],
  outline: {
    // autocasts as new SimpleLineSymbol()
    color: [255, 255, 255],
    width: 2,
  },
};
const pointGraphic = new Graphic({
  geometry: point,
  symbol: markerSymbol,
});
graphicsLayer.add(pointGraphic);

//////////////////////////////
// Point control
//////////////////////////////
onPlayClick("query-attribute", () => {
  view.map.layers.add(graphicsLayer);

  let sketchVM = new SketchViewModel({
    layer: graphicsLayer,
    view: view,
    defaultCreateOptions: {
      hasZ: true, // default value
    },
    defaultUpdateOptions: {
      enableZ: true, // default value
    },
  });

  view.on("click", async (e) => {
    const hitTestResult = await view.hitTest(e);
    if (hitTestResult.results.find((r) => r.graphic === pointGraphic)) {
      sketchVM.update(pointGraphic);
    }
  });

  queryFeatures(
    ["solarAreaSuitableM2"],
    "solarAreaSuitableM2 BETWEEN 0 AND 500",
    pointGraphic.geometry
  );
  sketchVM.on("update", () => {
    queryFeatures(
      ["solarAreaSuitableM2"],
      "solarAreaSuitableM2 BETWEEN 200 AND 500",
      pointGraphic.geometry
    );
  });
});

onPlayClick("query-server", () => {
  view.map.layers.remove(graphicsLayer);
  if (highlight) {
    highlight.remove();
  }
  queryFeatures(
    ["solarAreaSuitableM2"],
    "solarAreaSuitableM2 BETWEEN 200 AND 500",
    pointGraphic.geometry,
    true
  );
});

onPlayClick("highlight-remove", () => {
  if (highlight) {
    highlight.remove();
  }
});

let highlight: IHandle;
//////////////////////////////
// QueryFeatures
//////////////////////////////

async function queryFeatures(
  fields: string[],
  queryString: string,
  center: Geometry,
  server = false
) {
  const layer = (await getLayerFromView(HELSINKI_BUILDING_NAME, view)) as SceneLayer;
  layer.outFields = fields;

  const layerView = (await view.whenLayerView(layer)) as SceneLayerView;

  const query = layerView.createQuery();
  query.where = queryString;
  if (!server) {
    query.geometry = center;
    query.distance = 100;
    query.units = "meters";
  }

  // query.outFields = [attributeName];

  const result = server ? await layer.queryFeatures(query) : await layerView.queryFeatures(query);
  if (highlight) {
    highlight.remove();
  }
  highlight = layerView.highlight(result.features);
}
