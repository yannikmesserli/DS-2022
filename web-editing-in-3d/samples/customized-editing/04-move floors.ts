import { intersects } from "@arcgis/core/geometry/geometryEngine";
import Polygon from "@arcgis/core/geometry/Polygon";
import Graphic from "@arcgis/core/Graphic";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import { floorsLayer } from "./utilities/layers";

let moveFloorInfos: MoveFloorInfo[] = [];
let originalFirstVertex: number[] = [];

export function setupMoveFloors(drawingSVM: SketchViewModel): void {
  drawingSVM.on("update", (ev) => {
    const type = ev.toolEventInfo?.type;

    // Only react when moving
    if (type !== "move" && type !== "move-start" && type !== "move-stop") {
      return;
    }

    const graphic = ev.graphics[0];
    const polygon = graphic.geometry as Polygon;

    if (type === "move-start") {
      moveFloorInfos = findOverlappingMoveFloorInfos(graphic);
      originalFirstVertex = polygon.rings[0][0].slice();
    }

    // Determine by how much we have moved from the start of the move by simply looking at the
    // first vertex
    const deltaX = polygon.rings[0][0][0] - originalFirstVertex[0];
    const deltaY = polygon.rings[0][0][1] - originalFirstVertex[1];

    // Move all other floors by the same amount given their original (cloned) geometry
    for (const info of moveFloorInfos) {
      const geometry = (info.geometry as Polygon).clone();

      for (const coordinate of geometry.rings[0]) {
        coordinate[0] += deltaX;
        coordinate[1] += deltaY;
      }

      info.floor.geometry = geometry;
    }
  });
}

function findOverlappingMoveFloorInfos(graphic: Graphic): MoveFloorInfo[] {
  const geometry = graphic.geometry;
  const overlappingFloors = floorsLayer.graphics.filter(
    (floor) => floor !== graphic && intersects(geometry, floor.geometry)
  );

  return overlappingFloors
    .map((floor) => ({ floor, geometry: floor.geometry.clone() as Polygon }))
    .toArray();
}

interface MoveFloorInfo {
  floor: Graphic;
  geometry: Polygon;
}
