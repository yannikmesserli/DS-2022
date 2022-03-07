import { whenOnce } from "@arcgis/core/core/reactiveUtils";
import SceneView from "@arcgis/core/views/SceneView";
import ElevationProfile from "@arcgis/core/widgets/ElevationProfile.js";
import ElevationProfileLineGround from "@arcgis/core/widgets/ElevationProfile/ElevationProfileLineGround";
import ElevationProfileLineView from "@arcgis/core/widgets/ElevationProfile/ElevationProfileLineView";
import "@esri/calcite-components";
import "@esri/calcite-components/dist/components/calcite-button";
import { saveAs } from "file-saver";
import { Parser } from "json2csv";
import { HIKING_TRAILS, SAN_FRANCISCO } from "../../../common/scenes";
import {
  initView,
  onInit,
  onPlayClick,
  throwIfAborted,
  throwIfNotAbortError,
} from "../../../common/utils";

let view: SceneView;
let widget: ElevationProfile;

onInit("elevation-profile", () => {
  view = initView(SAN_FRANCISCO);
  onPlayClick("add-widget", addWidget);
  onPlayClick("set-profiles", setGroundAndViewProfileLines);
});

onInit("elevation-profile-csv", () => {
  view = initView(HIKING_TRAILS);
  addWidget();
  onPlayClick("add-export-button", addExportButton);
});

/**
 * Creates a new elevation profile widget and adds it to the view.
 */
function addWidget() {
  widget = new ElevationProfile({
    view,
    profiles: [makeGroundProfileLine()], // Only a line which samples the ground
  });
  view.ui.add(widget, "top-right");
}

/**
 * Configures the elevation profile widget such that it displays a line
 * representing the elevation of the ground and another one representing the
 * elevation of everything else (buildings, integrated mesh, etc).
 */
function setGroundAndViewProfileLines() {
  widget.profiles.removeAll();
  widget.profiles.addMany([makeGroundProfileLine(), makeViewProfileLine()]);
}

/**
 * Makes a new profile line which samples elevation from the elevation layers in
 * the `view.map.ground`.
 */
function makeGroundProfileLine() {
  return new ElevationProfileLineGround({
    color: "#0000ff", // Optional custom color
    title: "Ground", // Optional custom title
  });
}

/**
 * Makes a new profile line which samples elevation from the view itself by
 * intersecting buildings, integrated mesh, etc. We also configure it to exclude
 * the ground from the intersections since we'll include the ground in another
 * profile line.
 */
function makeViewProfileLine() {
  return new ElevationProfileLineView({
    title: "Layers",
    color: "#555555",
    exclude: [view.map.ground], // We're not interested in the ground
  });
}

/**
 * Adds a button to the view which, when clicked, allows the user to download
 * the currently-generated elevation profile as a CSV file.
 */
function addExportButton() {
  const button = document.createElement("calcite-button");
  button.textContent = "Download as CSV";
  view.ui.add(button, "bottom-left");

  button.addEventListener("click", downloadCSV);
}

let abortController: AbortController | null = null;

/**
 * Generates a CSV file from the elevation profile data
 * and offers it for download.
 */
async function downloadCSV() {
  // Grab the samples from our profile line.
  const groundProfileLine = widget.profiles.getItemAt(0);

  abortController?.abort();
  const { signal } = (abortController = new AbortController());

  try {
    // Make sure the profile is fully generated.
    await whenOnce(() => groundProfileLine.progress === 1, signal);
    throwIfAborted(signal);

    exportToCSV(groundProfileLine.samples);
  } catch (e) {
    throwIfNotAbortError(e);
  }
}

function exportToCSV(samples: __esri.ElevationProfileSample[]): void {
  const fields = ["distance", "elevation", "x", "y", "z"];
  const parser = new Parser({ fields });
  const csv = parser.parse(samples);

  // Make a new blob with our CSV data and offer it for download using FileSaver.js
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  saveAs(blob, "profile-data.csv");
}
