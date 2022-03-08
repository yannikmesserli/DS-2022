import Camera from "@arcgis/core/Camera";
import { Point, SpatialReference } from "@arcgis/core/geometry";
import AreaMeasurement3D from "@arcgis/core/widgets/AreaMeasurement3D";
import { MUNICH } from "../../../common/scenes";
import { addOAuthSupport, initView, onPlayClick } from "../../../common/utils";

addOAuthSupport();

const view = initView(
  MUNICH,
  new Camera({
    position: new Point({
      spatialReference: SpatialReference.WebMercator,
      x: 1288725.3850151028,
      y: 6129370.547797157,
      z: 713.2540805945173,
    }),
    heading: 337.63207497748215,
    tilt: 46.6208287633336,
  })
);

let widget: AreaMeasurement3D | null = null;

onPlayClick("add-widget", () => {
  widget?.destroy();

  widget = new AreaMeasurement3D({ view });
  view.ui.add(widget, "top-right");

  view.goTo({
    position: {
      spatialReference: SpatialReference.WebMercator,
      x: 1288682.1047434486,
      y: 6129508.304774809,
      z: 583.0960625251755,
    },
    heading: 330.9693414618945,
    tilt: 56.40951075600771,
  });
});

onPlayClick("set-units", () => {
  if (!widget) {
    return;
  }

  widget.viewModel.unit = "square-kilometers";
  widget.viewModel.unitOptions = ["square-meters", "square-kilometers"];
});
