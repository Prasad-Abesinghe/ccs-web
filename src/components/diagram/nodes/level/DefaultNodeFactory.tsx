import * as React from "react";
import { DefaultNodeModel } from "@projectstorm/react-diagrams";
import { DefaultNodeWidget } from "./DefaultNodeWidget";
import { AbstractReactFactory } from "@projectstorm/react-canvas-core";
import { type DiagramEngine } from "@projectstorm/react-diagrams-core";
import { type JSX } from "react";

export class DefaultNodeFactory extends AbstractReactFactory<
  DefaultNodeModel,
  DiagramEngine
> {
  constructor() {
    super("default");
  }

  generateReactWidget(event: { model: unknown; }): JSX.Element {
    return <DefaultNodeWidget engine={this.engine} node={event.model as DefaultNodeModel} />;
  }

  generateModel(): DefaultNodeModel {
    return new DefaultNodeModel();
  }
}
