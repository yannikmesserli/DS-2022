import * as promiseUtils from "@arcgis/core/core/promiseUtils";
import * as watchUtils from "@arcgis/core/core/watchUtils";
import { Polygon, Polyline } from "@arcgis/core/geometry";
import Mesh from "@arcgis/core/geometry/Mesh";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";
import Graphic from "@arcgis/core/Graphic";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import GroupLayer from "@arcgis/core/layers/GroupLayer";
import FieldsContent from "@arcgis/core/popup/content/FieldsContent";
import PopupTemplate from "@arcgis/core/PopupTemplate";
import { SimpleRenderer } from "@arcgis/core/renderers";
import {
  LineSymbol3D,
  MeshSymbol3D,
  PathSymbol3DLayer,
  WaterSymbol3DLayer,
} from "@arcgis/core/symbols";
import FillSymbol3DLayer from "@arcgis/core/symbols/FillSymbol3DLayer";
import PolygonSymbol3D from "@arcgis/core/symbols/PolygonSymbol3D";
import SceneView from "@arcgis/core/views/SceneView";
import Editor from "@arcgis/core/widgets/Editor";
import Expand from "@arcgis/core/widgets/Expand";
import LayerList from "@arcgis/core/widgets/LayerList";
import * as meshUtils from "@arcgis/core/geometry/support/meshUtils";
import AreaMeasurement3D from "@arcgis/core/widgets/AreaMeasurement3D";
import DirectLineMeasurement3D from "@arcgis/core/widgets/DirectLineMeasurement3D";
import SolidEdges3D from "@arcgis/core/symbols/edges/SolidEdges3D";

const source = new FeatureLayer({
  url: "https://services2.arcgis.com/cFEFS0EWrhfDeVw9/arcgis/rest/services/Demo_2D_Editing_Layer/FeatureServer/2",
  renderer: new SimpleRenderer({
    symbol: new PolygonSymbol3D({
      symbolLayers: [
        new FillSymbol3DLayer({
          material: {
            color: [48, 159, 255, 0.5],
          },
          outline: {
            color: [49, 64, 77],
            size: 1,
          },
        }),
      ],
    }),
  }),
  outFields: ["*"],
  // popupEnabled: false,
});

const relativePath = new GraphicsLayer({
  title: "Relative Path",
  elevationInfo: {
    mode: "on-the-ground",
  },
});

const absolutePath = new GraphicsLayer({
  title: "Upper bound",
  elevationInfo: {
    mode: "absolute-height",
  },
});

const splitPath = new GraphicsLayer({
  title: "Segments",
  elevationInfo: {
    mode: "absolute-height",
  },
});

const meshGraphics = new GraphicsLayer({
  title: "Mesh",
  elevationInfo: {
    mode: "absolute-height",
  },
});

const bufferMesh = new GraphicsLayer({
  title: "Buffered Mesh",
  elevationInfo: {
    mode: "absolute-height",
  },
});

const lakeSurface = new GraphicsLayer({
  title: "Lake Surface",
  elevationInfo: {
    mode: "absolute-height",
  },
});

const wallLayers = [relativePath, absolutePath, splitPath, meshGraphics, bufferMesh].reverse();

const lakeLayers = new GroupLayer({
  title: "Lakes",
  visibilityMode: "exclusive",
  layers: [lakeSurface, source],
});

const group = new GroupLayer({
  title: "Walls",
  visibilityMode: "exclusive",
  layers: wallLayers,
});

const view = new SceneView({
  container: "viewDiv",
  map: {
    basemap: "satellite",
    ground: "world-elevation",
    layers: [lakeLayers, group],
  },
  camera: {
    position: {
      longitude: 8.87094652,
      latitude: 46.7220257,
      z: 5130.19502,
    },
    heading: 348.2,
    tilt: 63.99,
  },
});

const editor = new Editor({
  view,
});

view.ui.add(
  new Expand({
    content: editor,
    expanded: false,
    group: "tools",
  }),
  "top-right"
);

view.ui.add(
  new Expand({
    content: new LayerList({ view }),
    expanded: false,
  }),
  "bottom-left"
);

view.ui.add(
  new Expand({
    content: new DirectLineMeasurement3D({ view }),
    expanded: false,
    group: "tools",
  }),
  "top-right"
);

view.ui.add(
  new Expand({
    content: new AreaMeasurement3D({ view }),
    expanded: false,
    group: "tools",
  }),
  "top-right"
);

function addRelativePath(line: Polyline, height: number) {
  relativePath.add(
    new Graphic({
      popupTemplate: new PopupTemplate({
        title: "Dam",
        content: [
          new FieldsContent({
            fieldInfos: [
              {
                label: "Height (m)",
                fieldName: "height",
                format: {
                  places: 2,
                  digitSeparator: true,
                },
              },
            ],
          }),
        ],
      }),
      geometry: line,
      attributes: {
        height,
      },
      symbol: new LineSymbol3D({
        symbolLayers: [
          new PathSymbol3DLayer({
            profile: "quad",
            profileRotation: "heading",
            height,
            width: 1,
            anchor: "bottom",
            material: {
              color: [150, 150, 150],
            },
          }),
        ],
      }),
    })
  );
}

function addAbsolutePath(wall: Polyline, height: number, elevation: number) {
  const bottomLine = wall.clone();
  bottomLine.paths.forEach((path) => {
    path.forEach((coords) => {
      coords[2] = elevation;
    });
  });

  absolutePath.add(
    new Graphic({
      popupTemplate: new PopupTemplate({
        title: "Dam",
        content: [
          new FieldsContent({
            fieldInfos: [
              {
                label: "Elevation at lowest point (m)",
                fieldName: "elevation",
                format: {
                  places: 2,
                  digitSeparator: true,
                },
              },
              {
                label: "Height (m)",
                fieldName: "height",
                format: {
                  places: 2,
                  digitSeparator: true,
                },
              },
            ],
          }),
        ],
      }),
      geometry: bottomLine,
      attributes: {
        elevation,
        height,
      },
      symbol: new LineSymbol3D({
        symbolLayers: [
          new PathSymbol3DLayer({
            profile: "quad",
            profileRotation: "heading",
            join: "bevel",
            cap: "none",
            height,
            width: 1,
            anchor: "bottom",
            material: {
              color: [150, 150, 150],
            },
          }),
        ],
      }),
    })
  );
}

function addWallSegment(wall: Polyline, height: number, elevation: number) {
  const bottomLine = wall.clone();
  bottomLine.paths.forEach((path) => {
    path.forEach((coords) => {
      coords[2] = elevation;
    });
  });

  splitPath.add(
    new Graphic({
      popupTemplate: new PopupTemplate({
        title: "Dam",
        content: [
          new FieldsContent({
            fieldInfos: [
              {
                label: "Elevation at lowest point (m)",
                fieldName: "elevation",
                format: {
                  places: 2,
                  digitSeparator: true,
                },
              },
              {
                label: "Height (m)",
                fieldName: "height",
                format: {
                  places: 2,
                  digitSeparator: true,
                },
              },
            ],
          }),
        ],
      }),
      geometry: bottomLine,
      attributes: {
        elevation,
        height,
      },
      symbol: new LineSymbol3D({
        symbolLayers: [
          new PathSymbol3DLayer({
            profile: "quad",
            profileRotation: "heading",
            join: "bevel",
            cap: "none",
            height,
            width: 1,
            anchor: "bottom",
            material: {
              color: [150, 150, 150],
            },
          }),
        ],
      }),
    })
  );
}

function addMesh(wall: Polyline, height: number, elevation: number) {
  const lowerBound = wall.clone();
  lowerBound.paths.forEach((path) => {
    path.forEach((coords) => {
      coords[2] = elevation;
    });
  });

  const rim = elevation + height;
  let area = 0;
  const meshes = wall.paths.map((path) => {
    const position = [];
    for (let idx = 0; idx < path.length - 1; idx++) {
      const distance = geometryEngine.geodesicLength(
        new Polyline({
          spatialReference: wall.spatialReference,
          paths: [
            [
              [path[idx][0], path[idx][1]],
              [path[idx + 1][0], path[idx + 1][1]],
            ],
          ],
        }),
        "meters"
      );

      area += distance * (rim - path[idx][2]);
      position.push(path[idx][0], path[idx][1], rim - 5);
      position.push(path[idx + 1][0], path[idx + 1][1], rim - 5);
      position.push(path[idx + 1][0], path[idx + 1][1], Math.min(rim, path[idx + 1][2]) - 5);

      position.push(path[idx][0], path[idx][1], rim - 5);
      position.push(path[idx + 1][0], path[idx + 1][1], Math.min(rim, path[idx + 1][2]) - 5);
      position.push(path[idx][0], path[idx][1], Math.min(rim, path[idx][2]) - 5);

      // positions.push(coordsTop[topIdx], coordsTop[topIdx+1], coordsBoottom[topIdx+1]);
      // positions.push(coordsTop[topIdx], coordsBoottom[topIdx+1], coordsBoottom[topIdx]);
    }
    return new Mesh({
      spatialReference: wall.spatialReference,
      vertexAttributes: {
        position,
      },
    });
  });

  const mesh = meshUtils.merge(meshes);

  meshGraphics.add(
    new Graphic({
      geometry: mesh,
      attributes: { height, elevation, area },
      symbol: new MeshSymbol3D({
        symbolLayers: [
          new FillSymbol3DLayer({
            material: {
              color: [180, 180, 180],
            },
          }),
        ],
      }),
      popupTemplate: new PopupTemplate({
        title: "Dam",
        content: [
          new FieldsContent({
            fieldInfos: [
              {
                label: "Elevation at lowest point (m)",
                fieldName: "elevation",
                format: {
                  places: 2,
                  digitSeparator: true,
                },
              },
              {
                label: "Area (sqm)",
                fieldName: "area",
                format: {
                  places: 2,
                  digitSeparator: true,
                },
              },
              {
                label: "Height (m)",
                fieldName: "height",
                format: {
                  places: 2,
                  digitSeparator: true,
                },
              },
            ],
          }),
        ],
      }),
    })
  );
}

function addVolumetricMesh(wall: Polyline, height: number, elevation: number) {
  const rim = elevation + height + 10;
  const meshes = wall.paths.map((path) => {
    const position = [];
    for (let idx = 0; idx < path.length - 1; idx++) {
      position.push(path[idx][0], path[idx][1], rim);
      position.push(path[idx + 1][0], path[idx + 1][1], rim);
      position.push(path[idx + 1][0], path[idx + 1][1], Math.min(rim, path[idx + 1][2]) - 5);

      position.push(path[idx][0], path[idx][1], rim);
      position.push(path[idx + 1][0], path[idx + 1][1], Math.min(rim, path[idx + 1][2]) - 5);
      position.push(path[idx][0], path[idx][1], Math.min(rim, path[idx][2]) - 5);
    }
    return new Mesh({
      spatialReference: wall.spatialReference,
      vertexAttributes: {
        position,
      },
    });
  });
  const ring = wall.clone().paths[0];
  ring.forEach((point) => (point[2] = rim));
  const buffer = new Polygon({
    spatialReference: wall.spatialReference,
    hasZ: true,
    rings: [ring],
  });

  const cover = Mesh.createFromPolygon(buffer);
  meshes.push(cover);

  const mesh = meshUtils.merge(meshes);

  bufferMesh.add(
    new Graphic({
      geometry: mesh,
      attributes: { height, elevation },
      symbol: new MeshSymbol3D({
        symbolLayers: [
          new FillSymbol3DLayer({
            material: {
              color: [180, 180, 180],
            },
            edges: new SolidEdges3D({
              color: [20, 20, 20],
              size: 0.75,
            }),
          }),
        ],
      }),
      popupTemplate: new PopupTemplate({
        title: "Dam",
        content: [
          new FieldsContent({
            fieldInfos: [
              {
                label: "Elevation at lowest point (m)",
                fieldName: "elevation",
                format: {
                  places: 2,
                  digitSeparator: true,
                },
              },
              {
                label: "Area (sqm)",
                fieldName: "area",
                format: {
                  places: 2,
                  digitSeparator: true,
                },
              },
              {
                label: "Height (m)",
                fieldName: "height",
                format: {
                  places: 2,
                  digitSeparator: true,
                },
              },
            ],
          }),
        ],
      }),
    })
  );
}

async function addLake(geometry: Polygon, height: number) {
  const spatialReference = geometry.spatialReference;

  const sampler = await view.map.ground.createElevationSampler(geometry.extent, {
    demResolution: "finest-contiguous",
  });

  geometry.rings.forEach((ring) => {
    const wall = new Polyline({
      spatialReference,
      paths: [ring],
    });

    const pointCount = 500;
    const length = geometryEngine.geodesicLength(wall);
    const distance = length / pointCount;
    const distanceAlongMeters = Math.max(25.0, distance);
    const denseWall = geometryEngine.geodesicDensify(wall, distanceAlongMeters) as Polyline;
    addRelativePath(denseWall, height);

    const elevatedWall = sampler.queryElevation(denseWall) as Polyline;
    let maxElevation = Number.MIN_VALUE;
    let minElevation = Number.MAX_VALUE;
    elevatedWall.paths.forEach((path) => {
      path.forEach((coords) => {
        maxElevation = Math.max(maxElevation, coords[2]);
        minElevation = Math.min(minElevation, coords[2]);
      });
    });

    addAbsolutePath(elevatedWall, height, minElevation);

    const rim = minElevation + height;

    const surface = geometry.clone();
    surface.hasZ = true;
    surface.rings.forEach((ring) => {
      ring.forEach((point) => {
        point.push(rim - 20);
      });
    });

    lakeSurface.add(
      new Graphic({
        geometry: surface,
        symbol: new PolygonSymbol3D({
          symbolLayers: [new WaterSymbol3DLayer({})],
        }),
      })
    );

    const segments = [] as number[][][];
    elevatedWall.paths.forEach((path) => {
      segments.push([]);
      path.forEach((point) => {
        segments[segments.length - 1].push(point);
        if (rim < point[2]) {
          segments.push([point]);
        }
      });
    });
    const paths = segments.filter((path) => 2 < path.length);
    const segment = new Polyline({
      spatialReference,
      paths,
    });

    addWallSegment(segment, height, minElevation);
    addMesh(segment, height, minElevation);

    const bufferInput = segment.clone();
    bufferInput.hasZ = false;

    const buffer = geometryEngine.buffer(bufferInput, 10, "meters") as Polygon;

    view.graphics.add(new Graphic({ geometry: buffer }));

    buffer.rings.forEach((ring) => {
      const bufferLine = new Polyline({
        spatialReference,
        paths: [ring],
      });
      const denseBuffer = geometryEngine.geodesicDensify(
        bufferLine,
        distanceAlongMeters
      ) as Polyline;

      const elevatedLine = sampler.queryElevation(bufferLine) as Polyline;

      addVolumetricMesh(elevatedLine, height, minElevation);
    });

    // elevatedWall.paths.forEach((path) => {
    //   let split: number[][] = [];
    //   path.forEach((point, idx) => {
    //     split.push(point);

    //     if ((rim <= point[2] || idx + 1 === path.length) && 1 < split.length) {
    //       const segment = new Polyline({
    //         spatialReference,
    //         paths: [split],
    //       });
    //       addWallSegment(segment, height, minElevation);
    //       addMesh(segment, height, minElevation);
    //       split = [];
    //     }
    //   });
    // });
  });
}

const updateLakes = promiseUtils.debounce(async () => {
  wallLayers.forEach((l) => l.removeAll());
  lakeSurface.removeAll();

  const lv = await view.whenLayerView(source);
  await watchUtils.whenNotOnce(lv, "updating");

  const query = lv.createQuery();
  query.returnGeometry = true;
  query.outFields = ["*"];
  const result = await lv.queryFeatures(query);
  await Promise.all(
    result.features.map(async (f) => {
      const height = f.getAttribute("Height");
      if (height) {
        await addLake(f.geometry as Polygon, height);
      }
    })
  );
});

// Load existing
view.when().then(async () => {
  view.environment.lighting!.directShadowsEnabled = true;
  view.environment.lighting!.waterReflectionEnabled = true;

  updateLakes();
});

(window as any)["view"] = view;

editor.viewModel.watch("state", () => {
  const state = editor.viewModel.state;
  const hide = state === "editing-existing-feature" || state === "editing-new-feature";

  group.visible = !hide;
});

source.on("edits", () => {
  updateLakes();
});

view.popup.autoOpenEnabled = true;
view.popup.defaultPopupTemplateEnabled = true;
