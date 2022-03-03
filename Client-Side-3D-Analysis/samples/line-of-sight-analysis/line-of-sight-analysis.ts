import LineOfSightAnalysis from "@arcgis/core/analysis/LineOfSightAnalysis";
import LineOfSightAnalysisObserver from "@arcgis/core/analysis/LineOfSightAnalysisObserver";
import LineOfSightAnalysisTarget from "@arcgis/core/analysis/LineOfSightAnalysisTarget";
import Point from "@arcgis/core/geometry/Point";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import LineOfSight from "@arcgis/core/widgets/LineOfSight";
import "@esri/calcite-components";
import "@esri/calcite-components/dist/components/button";
import { MUNICH } from "../../../common/scenes";
import { initView, onPlayClick } from "../../../common/utils";

const spatialReference = SpatialReference.WebMercator;

const landmarks: { name: string; threshold: number; position: Point }[] = [
  {
    name: "Neues Rathaus",
    threshold: 5,
    position: new Point({ spatialReference, x: 1288578.8301545328, y: 6129760.9954138035, z: 590 }),
  },
  {
    name: "St Peter's Church - Tower 1",
    threshold: 15,
    position: new Point({ spatialReference, x: 1288301.6231510378, y: 6129918.859183111, z: 610 }),
  },
  {
    name: "St Peter's Church - Tower 2",
    threshold: 15,
    position: new Point({ spatialReference, x: 1288300.8203933963, y: 6129956.649379852, z: 610 }),
  },
];

const cafes: { name: string; position: Point }[] = [
  {
    name: "Cafe 1",
    position: new Point({ spatialReference, x: 1288546.8915676193, y: 6129701.308535944, z: 518.4979617614299 }),
  },
  {
    name: "Cafe 2",
    position: new Point({ spatialReference, x: 1288569.1527418362, y: 6129695.921143464, z: 518.1832591928542 }),
  },
  {
    name: "Cafe 3",
    position: new Point({ spatialReference, x: 1288655.002978257, y: 6129675.878388246, z: 514.9744711806998 }),
  },
];

const view = initView(MUNICH);

let analysis: LineOfSightAnalysis | null = null;
let widget: LineOfSight | null = null;

onPlayClick("add-buttons", () => {
  cafes.forEach(({ name, position }) => {
    const button = document.createElement("calcite-button");
    button.color = "neutral";
    button.appearance = "solid";
    button.textContent = name;

    button.addEventListener("click", () => {
      analysis = new LineOfSightAnalysis({
        observer: new LineOfSightAnalysisObserver({ position }),
        targets: landmarks.map((landmark) => {
          return new LineOfSightAnalysisTarget({ position: landmark.position });
        }),
      });

      (view as any).analyses.removeAll();
      (view as any).analyses.add(analysis);

      if (widget) {
        createWidget();
      }
    });

    view.ui.add(button, "bottom-left");
  });
});

onPlayClick("add-widget", createWidget);

function createWidget(): void {
  if (widget) {
    view.ui.remove(widget);
    widget.destroy();
  }

  widget = new LineOfSight({ view, analysis } as any);
  view.ui.add(widget, "top-right");
}
