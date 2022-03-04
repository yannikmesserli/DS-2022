import SliceAnalysis from "@arcgis/core/analysis/SliceAnalysis";
import SlicePlane from "@arcgis/core/analysis/SlicePlane";
import WebScene from "@arcgis/core/WebScene";
import Slice from "@arcgis/core/widgets/Slice";
import "@esri/calcite-components";
import "@esri/calcite-components/dist/components/button";
import { ESRI_OFFICE_BSL } from "../../../common/scenes";
import { initView, onPlayClick } from "../../../common/utils";

interface SlideInfo {
  title: string;
  shape: SlicePlane;
}

// Information about which slice plane we would like to activate for each slide
// in our scene. We will identify the slide by its title.
const SLIDES: SlideInfo[] = [
  {
    title: "Front",
    shape: new SlicePlane({
      position: {
        spatialReference: { wkid: 4326 },
        x: -117.18678980519542,
        y: 34.05998560966533,
        z: 413.94244076963514,
      },
      heading: 180.46565254458895,
      tilt: 269.9999987925818,
      width: 49.04635028105781,
      height: 33.2090051697465,
    }),
  },
  {
    title: "Top",
    shape: new SlicePlane({
      position: {
        spatialReference: { wkid: 4326 },
        x: -117.18677129282855,
        y: 34.05990837974229,
        z: 410.4107119254768,
      },
      heading: 0.6657849842134532,
      tilt: 0.00000775363957927766,
      width: 56.863034126173964,
      height: 54.13647355579905,
    }),
  },
  {
    title: "Tilted",
    shape: new SlicePlane({
      position: {
        spatialReference: { wkid: 4326 },
        x: -117.18677129282855,
        y: 34.05990837974229,
        z: 413.4107119254768,
      },
      heading: 0.6657849842134532,
      tilt: 0.00000775363957927766,
      width: 56.863034126173964,
      height: 54.13647355579905,
    }),
  },
];

let widget: Slice | null = null;
let analysis: SliceAnalysis | null = null;

const view = initView(ESRI_OFFICE_BSL);

onPlayClick("add-buttons", async () => {
  await (view.map as WebScene).when();
  SLIDES.forEach(addSlideButton);
});

onPlayClick("add-widget", createWidget);

/**
 * Creates a button which allows selecting a viewpoint
 * from where one can look at the sliced building.
 */
function addSlideButton({ title, shape }: SlideInfo) {
  // Find the slide corresponding to the slice info for which we'll create a button.
  const slide = (view.map as WebScene).presentation.slides.find((s) => s.title.text === title);

  // Create a button which applies the slide when clicked.
  const button = document.createElement("calcite-button");
  button.color = "neutral";
  button.textContent = title;

  button.addEventListener("click", () => {
    analysis = new SliceAnalysis({ shape });

    // Apply the slice to show the inside of the building.
    (view as any).analyses.removeAll();
    (view as any).analyses.add(analysis);

    if (widget) {
      createWidget();
    }

    // Move to the right viewpoint.
    slide.applyTo(view);
  });

  view.ui.add(button, "bottom-left");
}

function createWidget(): void {
  if (widget) {
    view.ui.remove(widget);
    widget.destroy();
  }

  widget = new Slice({ view, analysis } as any);
  view.ui.add(widget, "top-right");
}
