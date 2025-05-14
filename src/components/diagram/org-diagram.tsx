"use client";

import createEngine, {
  DiagramModel,
  DefaultNodeModel,
  DefaultLinkModel,
  DagreEngine,
} from "@projectstorm/react-diagrams";
import * as React from "react";
import { CanvasWidget } from "@projectstorm/react-canvas-core";
import { Canvas } from "./canvas";
import { type Level } from "~/app/actions";

// Recursive function to generate nodes and links for each level and its children
function generateNodesAndLinks(
  level: Level,
  model: DiagramModel,
  parentNode?: DefaultNodeModel,
  xOffset = 100,
  yOffset = 100,
  depth = 0,
): DefaultNodeModel {
  // Create node for current level
  const nodeId = getNodeID(level);
  const node = new DefaultNodeModel({
    id: nodeId,
    name: level.name,
    color: "rgb(52, 64, 4)",
    locked: true,
  });
  const inPort = node.addInPort(getPortName(nodeId, true));
  node.addOutPort(getPortName(nodeId, false));
  node.setPosition(xOffset, yOffset);
  model.addNode(node);

  // If there's a parent, create a link
  if (parentNode) {
    const parentId = parentNode.getID();
    const parentOutPort = parentNode
      .getOutPorts()
      .find((port) => port.getName() === getPortName(parentId, false));
    if (parentOutPort) {
      const link = new DefaultLinkModel();
      link.setSourcePort(parentOutPort);
      link.setTargetPort(inPort);
      model.addLink(link);
    }
  }

  if (depth > 0) {
    return node;
  }

  // Process children recursively with appropriate offsets
  level.children.forEach((child, index) => {
    generateNodesAndLinks(
      child,
      model,
      node,
      xOffset + 200, // Offset each level to the right
      yOffset + index * 100, // Stack children vertically
      depth + 1,
    );
  });

  return node;
}

function getNodeID(level: Level) {
  return level.id;
}

function getPortName(nodeId: string, inPort: boolean) {
  return `${inPort ? "in" : "out"}`;
}

function genDagreEngine() {
  return new DagreEngine({
    graph: {
      rankdir: "LR",
      marginx: 25,
      marginy: 25,
      nodesep: 100,
      ranksep: 300,
    },
    nodeMargin: 25,
  });
}

export function OrgDiagram(props: { levels: Level[] }) {
  const [engine] = React.useState(() => {
    const engine = createEngine();
    // Register the PathFindingLinkFactory since we're using it
    return engine;
  });
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const model = new DiagramModel();

    // Generate hierarchy from all top-level items
    props.levels.forEach((level, index) => {
      generateNodesAndLinks(level, model, undefined, 100, 100 + index * 200);
    });

    engine.setModel(model);

    const dagreEngine = genDagreEngine();
    dagreEngine.redistribute(model);

    // Wait for the next frame to ensure DOM is rendered
    setTimeout(() => {
      engine.repaintCanvas();
      setReady(true);
    }, 10);

    return () => {
      // Cleanup
      engine.setModel(new DiagramModel());
    };
  }, [engine, props.levels]);

  if (!ready) {
    return <Canvas>Loading diagram...</Canvas>;
  }

  return (
    <Canvas>
      <CanvasWidget engine={engine} />
    </Canvas>
  );
}
