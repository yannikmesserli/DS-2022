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
  const check = () => {
    if (getFragmentId(Reveal.getCurrentSlide()?.querySelector(".current-fragment")) === id) {
      cb();
    }
  };

  Reveal.addEventListener("fragmenthidden", check);
  Reveal.addEventListener("fragmentshown", check);
  check();
}

function getFragmentId(element: Element | null | undefined): string | null {
  return element?.getAttribute("data-fragment-id") ?? null;
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

export function setHeader(header: string, selector: string = ".header"): void {
  const headerElement = Reveal.getCurrentSlide().querySelector(selector);
  if (!headerElement) {
    return;
  }

  headerElement.textContent = header;
}

export function throwIfAborted(signal: AbortSignal): void {
  if (signal.aborted) {
    throw new Error("AbortError");
  }
}

export function throwIfNotAbortError(e: any): void {
  if (e?.message !== "AbortError") {
    throw e;
  }
}
