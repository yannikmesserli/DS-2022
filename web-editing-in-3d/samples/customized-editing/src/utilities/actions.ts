import "@esri/calcite-components/dist/components/calcite-action";
import "@esri/calcite-components/dist/components/calcite-action-bar";

let activeAction: IHandle | null = null;

export function addToolbarAction(icon: string, action: () => IHandle): void {
  const calciteAction = document.createElement("calcite-action");
  calciteAction.icon = icon;
  calciteAction.addEventListener("click", () => activate(action));

  const toolbar = document.getElementById("action-bar") as HTMLElement;
  toolbar.appendChild(calciteAction);
}

function activate(action: Action): void {
  if (activeAction) {
    activeAction.remove();
  }

  activeAction = action();
}

type Action = () => IHandle;
