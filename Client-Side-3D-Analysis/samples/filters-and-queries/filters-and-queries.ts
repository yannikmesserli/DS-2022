import Geometry from "@arcgis/core/geometry/Geometry";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import SceneLayer from "@arcgis/core/layers/SceneLayer";
import FeatureFilter from "@arcgis/core/layers/support/FeatureFilter";
import SceneLayerView from "@arcgis/core/views/layers/SceneLayerView";
import Sketch from "@arcgis/core/widgets/Sketch";
import { HELSINKI, HELSINKI_BUILDING_NAME, HELSINKI_FIELDS } from "../../../common/scenes";
import {
  addOAuthSupport,
  addSumArea,
  applySolarAreaRenderer,
  getLayerFromView,
  initView,
  onPlayClick,
  statDefinition,
  sumLabel,
} from "../../../common/utils";

addOAuthSupport();

const view = initView(HELSINKI);
view.popup.defaultPopupTemplateEnabled = true;

getLayerFromView(HELSINKI_BUILDING_NAME, view).then((layer) => {
  layer.outFields = [HELSINKI_FIELDS.solarAreaField];
  applySolarAreaRenderer(layer);
});

// Add graphics layer for sketch
const sketchLayer = new GraphicsLayer({
  elevationInfo: { mode: "on-the-ground" },
});
view.map.add(sketchLayer);

// Add sketch widget
const sketch = new Sketch({
  layer: sketchLayer,
  view: view,
  creationMode: "update", // immediately select created geometry
});

let geometry: Geometry;

getLayerFromView(HELSINKI_BUILDING_NAME, view).then((layer) => {
  view.whenLayerView(layer).then((layerView) => {
    // Watch geometry creation
    sketch.on("create", (event) => {
      if (event.state === "complete") {
        geometry = event.graphic.geometry;

        layerView.filter = new FeatureFilter({
          geometry,
          spatialRelationship: "contains",
        });
      }
    });

    // Watch geometry change (move/reshape)
    sketch.on("update", (event: any) => {
      if (!event.cancelled && event.graphics.length) {
        geometry = event.graphics[0].geometry;

        layerView.filter = new FeatureFilter({
          geometry,
          spatialRelationship: "contains",
        });
      }
    });

    view.ui.add(sketch, "bottom-left");
  });
});
//////////////////////////////
// Point control
//////////////////////////////
onPlayClick("query-and-filter", () => {
  queryFeatures();
});

onPlayClick("query-and-filter-2", async () => {
  const layer = await getLayerFromView(HELSINKI_BUILDING_NAME, view);
  const layerView = (await view.whenLayerView(layer)) as SceneLayerView;
  layerView.filter = null!;
  queryFeatures(geometry);
});

let highlight: IHandle;
//////////////////////////////
// QueryFeatures
//////////////////////////////

async function queryFeatures(geometry?: Geometry) {
  addSumArea(view);
  const layer = (await getLayerFromView(HELSINKI_BUILDING_NAME, view)) as SceneLayer;
  layer.outFields = [HELSINKI_FIELDS.solarAreaField];

  const layerView = (await view.whenLayerView(layer)) as SceneLayerView;

  const query = layerView.createQuery();
  query.outStatistics = statDefinition;
  query.where = "solarAreaSuitableM2 BETWEEN 200 AND 500";

  if (geometry) {
    query.geometry = geometry;
    query.spatialRelationship = "contains";
  }

  // query.outFields = [attributeName];

  const result = await layerView.queryFeatures(query);
  (document.getElementById("sum") as HTMLDivElement).innerHTML =
    "Total area: " + result.features[0].attributes[sumLabel].toFixed(1);
  if (highlight) {
    highlight.remove();
  }
  highlight = layerView.highlight(result.features);
}
