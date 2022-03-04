import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import IntegratedMeshLayer from "@arcgis/core/layers/IntegratedMeshLayer";

export const modificationsLayer = new GraphicsLayer();

export const munichLayer = new IntegratedMeshLayer({
  portalItem: { id: "7a4ce32df4774997bbb32f230efbe7cc" },
});

export const floorsLayer = new GraphicsLayer();

export const extrudeHandleLayer = new GraphicsLayer();
