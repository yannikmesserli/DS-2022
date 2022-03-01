// @ts-check
import WebScene from "@arcgis/core/WebScene";
import SceneView from "@arcgis/core/views/SceneView";
import Fullscreen from "@arcgis/core/widgets/Fullscreen";

const Reveal = (parent as any).Reveal as RevealStatic;

export function onInit(title: string, cb: () => void) {
  if (Reveal.getCurrentSlide().getAttribute("data-slideId") === title) {
    cb();
  }
}

export function onFragment(id: string, cb: () => void) {
  Reveal.addEventListener("fragmentshown", (event) => {
    if (event.fragment.getAttribute("data-fragment-id") === id) {
      cb();
    }
  });
}

export function initView(itemId?: string) {
  const view = new SceneView({
    map: itemId ? new WebScene({ portalItem: { id: itemId } }) : new WebScene({ basemap: "topo" }),
    container: "viewDiv",
    qualityProfile: "high",
    popup: { defaultPopupTemplateEnabled: false },
  });

  view.ui.add(new Fullscreen({ view }), "bottom-right");

  return view;
}

export function throwIfAborted(signal: AbortSignal) {
  if (signal.aborted) {
    throw new Error("AbortError");
  }
}

export function throwIfNotAbortError(e: any) {
  if (e?.message !== "AbortError") {
    throw e;
  }
}
