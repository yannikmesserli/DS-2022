// @ts-check
import SceneView from "@arcgis/core/views/SceneView";
import DirectLineMeasurement3D from "@arcgis/core/widgets/DirectLineMeasurement3D";
import { initView, onFragment, onInit } from "../../../common/utils";

const view = initView();
const widget = new DirectLineMeasurement3D({ view: view });
view.ui.add(widget, "top-right");

onFragment("set-units", () => {});
