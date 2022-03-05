import SolidEdges3D from "@arcgis/core/symbols/edges/SolidEdges3D";
import ExtrudeSymbol3DLayer from "@arcgis/core/symbols/ExtrudeSymbol3DLayer";
import FillSymbol3DLayer from "@arcgis/core/symbols/FillSymbol3DLayer";
import PolygonSymbol3D from "@arcgis/core/symbols/PolygonSymbol3D";
import { FLOOR_HEIGHT } from "./constants";

const floorColor = [100, 130, 180];

export const floorSymbol = new PolygonSymbol3D({
  symbolLayers: [
    new ExtrudeSymbol3DLayer({
      material: { color: floorColor },
      edges: new SolidEdges3D({ size: "1px", color: [50, 50, 50] }),
      size: FLOOR_HEIGHT,
    }),
  ],
});

export const selectedFloorSymbol = new PolygonSymbol3D({
  symbolLayers: [
    new ExtrudeSymbol3DLayer({
      material: { color: floorColor },
      edges: new SolidEdges3D({ size: "1px", color: [255, 255, 255] }),
      size: FLOOR_HEIGHT,
    }),
  ],
});

export const modificationsSymbol = new PolygonSymbol3D({
  symbolLayers: [
    new FillSymbol3DLayer({
      outline: {
        size: "2px",
        color: "white",
      },
    }),
  ],
});
