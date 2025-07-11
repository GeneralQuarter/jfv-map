import { type Accessor, createSignal } from 'solid-js';
import type { MeasureGraph, MeasureNode } from '@/models/measure-graph';

type CreateMeasureGraph = [
  graph: Accessor<MeasureGraph>,
  addMeasure: (a: MeasureNode, b: MeasureNode) => void,
  removeMeasure: (edge: [string, string]) => void,
];

export default function createMeasureGraph(): CreateMeasureGraph {
  const [graph, setGraph] = createSignal<MeasureGraph>({
    nodes: {},
    edges: [],
  });

  const hasNode = (node: MeasureNode) => {
    return !!graph().nodes[node.id];
  };

  const isSameEdge = (
    [a0, a1]: [string, string],
    [b0, b1]: [string, string],
  ): boolean => {
    return (a0 === b0 && a1 === b1) || (a1 === b0 && a0 === b1);
  };

  const hasEdge = (edge: [string, string]) => {
    return graph().edges.some((e) => isSameEdge(edge, e));
  };

  const hasEdgeWith = (id: string) => {
    return graph().edges.some(([a0, a1]) => a0 === id || a1 === id);
  };

  const addMeasure = (a: MeasureNode, b: MeasureNode) => {
    if (a.id === b.id) {
      return;
    }

    const newGraph = { ...graph() };
    let modified = false;

    if (!hasNode(a)) {
      newGraph.nodes[a.id] = { ...a };
      modified = true;
    }

    if (!hasNode(b)) {
      newGraph.nodes[b.id] = { ...b };
      modified = true;
    }

    if (hasEdge([a.id, b.id])) {
      if (modified) {
        setGraph(newGraph);
      }
      return;
    }

    newGraph.edges.push([a.id, b.id]);
    setGraph(newGraph);
  };

  const removeMeasure = (edge: [string, string]) => {
    if (!hasEdge(edge)) {
      return;
    }

    const newGraph = { ...graph() };
    const edgeIndex = newGraph.edges.findIndex((e) => isSameEdge(edge, e));
    newGraph.edges.splice(edgeIndex, 1);

    if (!hasEdgeWith(edge[0])) {
      delete newGraph.nodes[edge[0]];
    }

    if (!hasEdgeWith(edge[1])) {
      delete newGraph.nodes[edge[1]];
    }

    setGraph(newGraph);
  };

  return [graph, addMeasure, removeMeasure];
}
