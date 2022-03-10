import Handles from "@arcgis/core/core/Handles";
import Point from "@arcgis/core/geometry/Point";
import Polygon from "@arcgis/core/geometry/Polygon";
import Graphic from "@arcgis/core/Graphic";
import ObjectSymbol3DLayer from "@arcgis/core/symbols/ObjectSymbol3DLayer";
import PointSymbol3D from "@arcgis/core/symbols/PointSymbol3D";
import SceneView from "@arcgis/core/views/SceneView";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import { addToolbarAction } from "./utilities/actions";
import { FLOOR_HEIGHT } from "./utilities/constants";
import { extrudeHandleLayer, floorsLayer } from "./utilities/layers";
import { floorSymbol, selectedFloorSymbol } from "./utilities/symbols";

let selectedFloor: Graphic | null = null;
let extrudedFloors: Graphic[] = [];

export function setupExtruding(view: SceneView): void {
  addToolbarAction("export-", () => {
    const handles = new Handles();

    handles.add([
      highlightOnPointerMove(view),
      createExtrudeHandleOnSelect(view, extrudeSVM, () => handles.removeAll()),
    ]);

    return {
      remove(): void {
        handles.destroy();
        extrudeSVM.cancel();

        selectedFloor = null;
        extrudedFloors.length = 0;
      },
    };
  });

  view.map.add(extrudeHandleLayer);

  const extrudeSVM = new SketchViewModel({
    view,
    layer: extrudeHandleLayer,
    defaultUpdateOptions: { enableRotation: false, enableScaling: false, tool: "move" },
  });

  extrudeSVM.on("update", (ev) => {
    if (ev.state === "complete") {
      // When the operation is done, remove the temporary handle graphic and reset the
      // state tracking of the extruded floors
      extrudeHandleLayer.removeAll();
      extrudedFloors.length = 0;
      return;
    }

    if (!selectedFloor) {
      return;
    }

    // We know that the floors are drawn with a constant Z value.
    // Take the Z from the first coordinate as the original Z.
    const originalZ = (selectedFloor.geometry as Polygon)?.rings[0][0][2];

    // Get the Z value of the handle graphic which we are moving up and down
    const z = (ev.graphics[0].geometry as Point).z;

    // Calculate how many floors we should add depending on how far away the handle graphic
    // is from the selected floor
    const numExtraFloors = Math.max(0, Math.floor((z - originalZ) / FLOOR_HEIGHT) - 1);

    // If we are moving down, then we may need to remove floors that were previously added
    if (numExtraFloors < extrudedFloors.length) {
      floorsLayer.removeMany(extrudedFloors.slice(numExtraFloors));
      extrudedFloors.length = numExtraFloors;
    }

    while (extrudedFloors.length < numExtraFloors) {
      const newFloor = selectedFloor.geometry.clone() as Polygon;

      const floorZ = originalZ + (extrudedFloors.length + 1) * FLOOR_HEIGHT;
      setPolygonZ(newFloor, floorZ);

      const newGraphic = new Graphic({ geometry: newFloor, symbol: floorSymbol });

      // Keep track of the extruded floors we have added during the manipulation so we know which
      // ones we should potentially remove
      extrudedFloors.push(newGraphic);
      floorsLayer.add(newGraphic);
    }
  });
}

/**
 * Set the Z value for all the coordinates in all the rings of a polygon.
 */
function setPolygonZ(polygon: Polygon, z: number): void {
  for (const ring of polygon.rings) {
    for (const coordinate of ring) {
      coordinate[2] = z;
    }
  }
}

/**
 * Highlight "selected" floor when moving the pointer on the screen. This will simply look for
 * any graphic hitting at the pointer location and override its symbol so it has an edge color
 * that makes it stand out.
 */
function highlightOnPointerMove(view: SceneView): IHandle {
  const handle = view.on("pointer-move", async (ev) => {
    const { results } = await view.hitTest(ev);

    const firstGraphic = results[0]?.graphic;

    // Make sure the graphic actually comes from the floors layer
    const floorGraphic = firstGraphic?.layer === floorsLayer ? firstGraphic : null;

    if (floorGraphic === selectedFloor) {
      return;
    }

    if (selectedFloor) {
      selectedFloor.symbol = floorSymbol;
    }

    selectedFloor = floorGraphic;

    if (selectedFloor) {
      selectedFloor.symbol = selectedFloorSymbol;
    }
  });

  return {
    remove() {
      handle.remove();

      // Make sure to reset the selected floor back to the original symbol when cleaning up
      if (selectedFloor) {
        selectedFloor.symbol = floorSymbol;
      }
    },
  };
}

/**
 * Creates the extrude handle graphic when clicking on a floor graphic.
 */
function createExtrudeHandleOnSelect(
  view: SceneView,
  extrudeSVM: SketchViewModel,
  callback: () => void
): IHandle {
  return view.on("immediate-click", (ev) => {
    if (!selectedFloor) {
      return;
    }

    ev.stopPropagation();

    // Create a graphic at the center of the selected floor geometry that serves as a handle we can
    // grab to move up and down
    const centroid = (selectedFloor.geometry as Polygon).centroid.clone();
    centroid.z += FLOOR_HEIGHT;

    const handleGraphic = new Graphic({
      geometry: centroid,
      symbol: new PointSymbol3D({
        symbolLayers: [
          new ObjectSymbol3DLayer({
            resource: { primitive: "cylinder" },
            height: 0.5,
            width: 3,
            depth: 3,
            material: { color: "orange" },
          }),
        ],
      }),
    });

    extrudeHandleLayer.add(handleGraphic);
    extrudeSVM.update(handleGraphic);

    callback();
  });
}
