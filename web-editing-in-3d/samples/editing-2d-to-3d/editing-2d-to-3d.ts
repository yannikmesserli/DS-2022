import FieldElement from "@arcgis/core/form/elements/FieldElement";
import FormTemplate from "@arcgis/core/form/FormTemplate";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import FeatureSnappingLayerSource from "@arcgis/core/views/interactive/snapping/FeatureSnappingLayerSource";
import MapView from "@arcgis/core/views/MapView";
import SceneView from "@arcgis/core/views/SceneView";
import WebMap from "@arcgis/core/WebMap";
import Editor from "@arcgis/core/widgets/Editor";
import Expand from "@arcgis/core/widgets/Expand";
import Fullscreen from "@arcgis/core/widgets/Fullscreen";
import SnappingControls from "@arcgis/core/widgets/support/SnappingControls";
import { onPlayClick } from "../../../common/utils";

let view: MapView | SceneView | null = null;

init("2d");

onPlayClick("use-scene-view", () => {
  view?.destroy();
  init("3d");
});

async function init(type: "2d" | "3d"): Promise<void> {
  const webmap = new WebMap({ portalItem: { id: "459a495fc16d4d4caa35e92e895694c8" } });

  const viewProps = { container: "viewDiv", map: webmap };
  view = type === "2d" ? new MapView(viewProps) : new SceneView(viewProps);
  await view.when();
  await webmap.loadAll();

  let pointLayer!: FeatureLayer;
  let lineLayer!: FeatureLayer;
  let polygonLayer!: FeatureLayer;

  view.map.allLayers.forEach((layer) => {
    if (isFeatureLayer(layer)) {
      switch (layer.geometryType) {
        case "polygon":
          polygonLayer = layer as FeatureLayer;
          break;
        case "polyline":
          lineLayer = layer;
          break;
        case "point":
          pointLayer = layer;
          break;
      }
    }
  });

  const pointInfos: __esri.LayerInfo = {
    layer: pointLayer,
    formTemplate: new FormTemplate({
      elements: [
        new FieldElement({ fieldName: "HazardType", label: "Hazard type" }),
        new FieldElement({ fieldName: "Description", label: "Description" }),
        new FieldElement({ fieldName: "SpecialInstructions", label: "Special Instructions" }),
        new FieldElement({ fieldName: "Status", label: "Status" }),
        new FieldElement({ fieldName: "Priority", label: "Priority" }),
      ],
    }),
  };

  const lineInfos: __esri.LayerInfo = {
    layer: lineLayer,
    formTemplate: new FormTemplate({
      elements: [
        new FieldElement({ fieldName: "Severity", label: "Severity" }),
        new FieldElement({ fieldName: "blocktype", label: "Type of blockage" }),
        new FieldElement({ fieldName: "fullclose", label: "Full closure" }),
        new FieldElement({ fieldName: "active", label: "Active" }),
        new FieldElement({ fieldName: "locdesc", label: "Location Description" }),
      ],
    }),
  };

  const polyInfos: __esri.LayerInfo = {
    layer: polygonLayer,
    formTemplate: new FormTemplate({
      elements: [
        new FieldElement({ fieldName: "incidenttype", label: "Incident Type" }),
        new FieldElement({ fieldName: "activeincid", label: "Active" }),
        new FieldElement({ fieldName: "descrip", label: "Description" }),
      ],
    }),
  };

  const editor = new Editor({
    view: view,
    layerInfos: [pointInfos, lineInfos, polyInfos],
    snappingOptions: {
      enabled: true,
      featureSources: [new FeatureSnappingLayerSource({ layer: pointLayer } as any)],
    },
  });

  const snappingControls = new SnappingControls({
    label: "Configure snapping options",
    view: view,
    snappingOptions: editor.snappingOptions, // Autocastable to SnappingOptions
  });

  // Create the Expand widget and set its content to that of the SnappingControls
  const snappingExpand = new Expand({
    expandIconClass: "esri-icon-settings2",
    expandTooltip: "Show snapping UI",
    expanded: false,
    view: view,
    content: snappingControls,
  });

  // Add the widgets to top and bottom right of the view
  view.ui.add(editor, "top-right");
  view.ui.add(snappingExpand, "bottom-right");

  view.ui.add(new Fullscreen({ view }), "bottom-left");
}

function isFeatureLayer(layer: __esri.Layer): layer is FeatureLayer {
  return layer.type === "feature";
}
