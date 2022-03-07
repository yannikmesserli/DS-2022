import Graphic from "@arcgis/core/Graphic";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import SceneLayer from "@arcgis/core/layers/SceneLayer";
import SceneLayerView from "@arcgis/core/views/layers/SceneLayerView";
import { HELSINKI, HELSINKI_BUILDING_NAME, HELSINKI_FIELDS } from "./scenes";
import {
  addEditablePoint,
  addOAuthSupport,
  addSumArea,
  applySolarAreaRenderer,
  getLayerFromView,
  initView,
  onPlayClick,
  statDefinition,
  sumLabel,
} from "./utils";
import Geometry from "@arcgis/core/geometry/Geometry";

addOAuthSupport();

const view = initView(HELSINKI);
view.popup.defaultPopupTemplateEnabled = true;

getLayerFromView(HELSINKI_BUILDING_NAME, view).then((layer) => {
  layer.outFields = [HELSINKI_FIELDS.solarAreaField];
  applySolarAreaRenderer(layer);
});
const { graphicsLayer, pointGraphic } = addEditablePoint(view, (pointGraphic: Graphic) =>
  queryFeatures(pointGraphic.geometry)
);

//////////////////////////////
// Point control
//////////////////////////////
onPlayClick("statistic-query", () => {
  view.map.layers.add(graphicsLayer);
  queryFeatures(pointGraphic.geometry);
});

onPlayClick("statistic-query-server", () => {
  view.map.layers.remove(graphicsLayer);
  if (highlight) {
    highlight.remove();
  }
  queryFeatures(pointGraphic.geometry, true);
});

let highlight: IHandle;
//////////////////////////////
// QueryFeatures
//////////////////////////////

async function queryFeatures(center: Geometry, server = false) {
  addSumArea(view);
  const layer = (await getLayerFromView(HELSINKI_BUILDING_NAME, view)) as SceneLayer;
  layer.outFields = [HELSINKI_FIELDS.solarAreaField, HELSINKI_FIELDS.usageField];

  const layerView = (await view.whenLayerView(layer)) as SceneLayerView;

  const query = layerView.createQuery();
  query.outStatistics = statDefinition as any;
  query.where = "solarAreaSuitableM2 BETWEEN 200 AND 500";

  const queryFeatureForHighlight = layerView.createQuery();
  queryFeatureForHighlight.where = "solarAreaSuitableM2 BETWEEN 200 AND 500";

  if (!server) {
    query.geometry = center;
    query.distance = 100;
    query.units = "meters";
    queryFeatureForHighlight.geometry = center;
    queryFeatureForHighlight.distance = 100;
    queryFeatureForHighlight.units = "meters";
  }

  const [result, resultForHighlight] = server
    ? await Promise.all([layer.queryFeatures(query), layer.queryFeatures(queryFeatureForHighlight)])
    : await Promise.all([
        layerView.queryFeatures(query),
        layerView.queryFeatures(queryFeatureForHighlight),
      ]);
  (document.getElementById("sum") as HTMLDivElement).innerHTML =
    "Total area: " + result.features[0].attributes[sumLabel].toFixed(1);
  if (highlight) {
    highlight.remove();
  }
  highlight = layerView.highlight(resultForHighlight.features);
}
