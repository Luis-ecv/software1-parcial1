
// src/config/flowConfig.js
import ClassNode from '../components/tablas/ClassNode';
import UmlEdge from '../components/UmlEdge';

export const nodeTypes = {
  classNode: ClassNode
};

export const edgeTypes = {
  umlEdge: UmlEdge
};

export const defaultEdgeOptions = {
  type: 'umlEdge',
  animated: false,
  style: {
    strokeWidth: 1.5,
    stroke: '#333'
  }
};