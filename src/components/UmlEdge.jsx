import React, { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from '@xyflow/react';

const UML_RELATIONSHIP_TYPES = {
  Association: {
    markerStart: 'none',
    markerEnd: 'none',
    strokeStyle: 'solid',
    stroke: '#000000'
  },
  Aggregation: {
    markerStart: 'none',
    markerEnd: 'diamond',
    strokeStyle: 'solid',
    stroke: '#1976d2'
  },
  Composition: {
    markerStart: 'none',
    markerEnd: 'diamond-filled',
    strokeStyle: 'solid',
    stroke: '#d32f2f'
  },
  Generalization: {
    markerStart: 'none',
    markerEnd: 'generalization',
    strokeStyle: 'solid',
    stroke: '#000000'
  },
  Implementation: {
    markerStart: 'none',
    markerEnd: 'generalization',
    strokeStyle: 'dashed',
    stroke: '#000000'
  },
  Dependency: {
    markerStart: 'none',
    markerEnd: 'arrow',
    strokeStyle: 'dashed',
    stroke: '#666666'
  }
};

const UmlEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style = {}
}) => {
  // Crea la ruta curva
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 5
  });

  if (!edgePath) return null;

  const edgeType = UML_RELATIONSHIP_TYPES[data?.type || 'Association'];
  const isSelected = data?.selected || false;
  
  // Estilos mejorados con feedback visual
  const edgeStyle = {
    ...style,
    stroke: isSelected ? '#dc2626' : edgeType.stroke, // Rojo cuando está seleccionado
    strokeWidth: isSelected ? 3 : 2, // Más grueso cuando está seleccionado
    strokeDasharray: edgeType.strokeStyle === 'dashed' ? '5,5' : 'none',
    cursor: 'pointer',
    filter: isSelected 
      ? 'drop-shadow(0 2px 6px rgb(220 38 38 / 0.4))' 
      : 'drop-shadow(0 1px 2px rgb(0 0 0 / 0.1))'
  };

  // Estilos para el área de click invisible
  const clickAreaStyle = {
    stroke: 'transparent',
    strokeWidth: 12, // Área grande para facilitar el click
    fill: 'none',
    cursor: 'pointer'
  };

  return (
    <>
      <defs>
        <marker
          id="arrow"
          viewBox="0 0 12 12"
          markerWidth="12"
          markerHeight="12"
          orient="auto-start-reverse"
          refX="10"
          refY="6"
        >
          <path d="M 0 0 L 12 6 L 0 12 z" fill="currentColor" />
        </marker>

        <marker
          id="generalization"
          viewBox="0 0 12 12"
          markerWidth="12"
          markerHeight="12"
          orient="auto-start-reverse"
          refX="11"
          refY="6"
        >
          <path d="M 0 0 L 12 6 L 0 12 L 0 0" fill="white" stroke="currentColor" />
        </marker>

        <marker
          id="diamond"
          viewBox="0 0 12 12"
          markerWidth="12"
          markerHeight="12"
          orient="auto-start-reverse"
          refX="11"
          refY="6"
        >
          <path d="M 0 6 L 6 0 L 12 6 L 6 12 z" fill="white" stroke="currentColor" />
        </marker>

        <marker
          id="diamond-filled"
          viewBox="0 0 12 12"
          markerWidth="12"
          markerHeight="12"
          orient="auto-start-reverse"
          refX="11"
          refY="6"
        >
          <path d="M 0 6 L 6 0 L 12 6 L 6 12 z" fill="currentColor" />
        </marker>
      </defs>

      {/* Área invisible para facilitar el click */}
      <path
        d={edgePath}
        style={clickAreaStyle}
        className="react-flow__edge-interaction"
      />
      
      {/* Edge visual principal */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={edgeStyle}
        markerEnd={edgeType.markerEnd ? `url(#${edgeType.markerEnd})` : undefined}
        markerStart={edgeType.markerStart ? `url(#${edgeType.markerStart})` : undefined}
      />

      <EdgeLabelRenderer>
        {/* Etiqueta general (data.label), si la quisieras en medio */}
        {data?.label && (
          <div
            style={{
              position: 'absolute',
              background: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 500,
              border: '1px solid rgba(0,0,0,0.1)',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY - 20}px)`
            }}
            className="nodrag nopan"
          >
            {data.label}
          </div>
        )}

        {/* Cardinalidad inicio */}
        {data?.startLabel && (
          <div
            style={{
              position: 'absolute',
              background: 'white',
              padding: '2px 4px',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'monospace',
              border: '1px solid #e2e8f0',
              transform: `translate(-50%, -50%) translate(${sourceX + 20}px,${sourceY - 20}px)`
            }}
            className="nodrag nopan"
          >
            {data.startLabel}
          </div>
        )}

        {/* Cardinalidad final */}
        {data?.endLabel && (
          <div
            style={{
              position: 'absolute',
              background: 'white',
              padding: '2px 4px',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'monospace',
              border: '1px solid #e2e8f0',
              transform: `translate(-50%, -50%) translate(${targetX - 20}px,${targetY - 20}px)`
            }}
            className="nodrag nopan"
          >
            {data.endLabel}
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
};

export default memo(UmlEdge);
