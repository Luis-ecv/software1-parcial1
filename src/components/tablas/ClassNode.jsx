// ClassNode.jsx
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import '../../../src/index.css';

function ClassNode({ data, isConnectable }) {
  // Opcional: parsear cada atributo si viene con un separador. 
  // Por ejemplo, si guardas "private edad: int", no hace falta transformarlo.
  // Pero si guardas "edad,int,private" tendrías que formatearlo aquí.

  return (
    <div className="class-node" style={{ minWidth: 160 }}>
      {/* Salida (source) */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        isConnectable={isConnectable}
        className="handle"
      />

      {/* Nombre de la clase */}
      <div className="class-name">
        <strong>{data.className || "ClaseSinNombre"}</strong>
      </div>

      {/* Atributos */}
      {data.attributes && data.attributes.length > 0 && (
        <div className="class-attributes">
          <h4>Atributos:</h4>
          <ul>
            {data.attributes.map((attr, idx) => (
              <li key={idx}>{attr}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Métodos */}
      {data.methods && data.methods.length > 0 && (
        <div className="class-methods">
          <h4>Métodos:</h4>
          <ul>
            {data.methods.map((method, idx) => (
              <li key={idx}>{method}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Entrada (target) */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        isConnectable={isConnectable}
        className="handle"
      />
    </div>
  );
}

export default ClassNode;
