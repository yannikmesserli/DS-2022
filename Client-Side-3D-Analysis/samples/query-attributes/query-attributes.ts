import Geometry from "@arcgis/core/geometry/Geometry";
import Graphic from "@arcgis/core/Graphic";
import SceneLayer from "@arcgis/core/layers/SceneLayer";
import SceneLayerView from "@arcgis/core/views/layers/SceneLayerView";
import { HELSINKI, HELSINKI_BUILDING_NAME, HELSINKI_FIELDS } from "../../../common/scenes";
import {
  addEditablePoint,
  addOAuthSupport,
  applySolarAreaRenderer,
  getLayerFromView,
  initView,
  onPlayClick,
} from "../../../common/utils";

addOAuthSupport();

const view = initView(HELSINKI);
view.popup.defaultPopupTemplateEnabled = true;

getLayerFromView(HELSINKI_BUILDING_NAME, view).then((layer) => {
  layer.outFields = [HELSINKI_FIELDS.solarAreaField];
  applySolarAreaRenderer(layer);
});
const { graphicsLayer, pointGraphic } = addEditablePoint(view, (pointGraphic: Graphic) =>
  queryFeatures(
    ["solarAreaSuitableM2"],
    "solarAreaSuitableM2 BETWEEN 200 AND 500",
    pointGraphic.geometry
  )
);

//////////////////////////////
// Point control
//////////////////////////////
onPlayClick("query-attribute", () => {
  view.map.layers.add(graphicsLayer);
  queryFeatures(
    ["solarAreaSuitableM2"],
    "solarAreaSuitableM2 BETWEEN 0 AND 500",
    pointGraphic.geometry
  );
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
