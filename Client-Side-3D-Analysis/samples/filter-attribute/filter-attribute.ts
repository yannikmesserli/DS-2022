import SceneLayer from "@arcgis/core/layers/SceneLayer";
import FeatureFilter from "@arcgis/core/layers/support/FeatureFilter";
import SceneLayerView from "@arcgis/core/views/layers/SceneLayerView";
import { HELSINKI, HELSINKI_BUILDING_NAME, HELSINKI_FIELDS } from "../../../common/scenes";
import {
  addOAuthSupport,
  applyYearRenderer,
  getLayerFromView,
  initView,
  onPlayClick,
} from "../../../common/utils";

addOAuthSupport();

const view = initView(HELSINKI);
view.popup.defaultPopupTemplateEnabled = true;

getLayerFromView(HELSINKI_BUILDING_NAME, view).then((layer) => {
  layer.outFields = [HELSINKI_FIELDS.yearField];
});

//////////////////////////////
// Point control
//////////////////////////////
onPlayClick("class-break", async () => {
  view.popup.visible = false;
  const layer = (await getLayerFromView(HELSINKI_BUILDING_NAME, view)) as SceneLayer;
  applyYearRenderer(layer);
});

onPlayClick("first-filter", async () => {
  const layer = (await getLayerFromView(HELSINKI_BUILDING_NAME, view)) as SceneLayer;
  const layerView = (await view.whenLayerView(layer)) as SceneLayerView;
  layerView.filter = new FeatureFilter({
    where: `${HELSINKI_FIELDS.yearField} > 1950`,
  });
});

onPlayClick("remove-filter", async () => {
  const layer = (await getLayerFromView(HELSINKI_BUILDING_NAME, view)) as SceneLayer;
  const layerView = (await view.whenLayerView(layer)) as SceneLayerView;
  layerView.filter = null!;
});
