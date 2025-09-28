import React, { useState, useEffect } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import '../../../src/index.css'; // Ajusta según tu ruta real

const LeftSidebar = ({
  addNode,
  selectedNode,
  selectedEdge,
  editingData,
  editingEdge,
  handleInputChange,
  handleInputChangeEdge,
  handleArrayChange,
  updateNodeData,
  updateEdgeData,
}) => {
  const [activeTab, setActiveTab] = useState('node');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Opciones de cardinalidad y tipos de relación
  const cardinalityOptions = ["0..1", "1", "0..*", "1..*", "*"];
  const relationshipTypes = [
    { value: "Association", label: "Asociación" },
    { value: "Aggregation", label: "Agregación" },
    { value: "Composition", label: "Composición" },
    { value: "Generalization", label: "Generalización" },
    { value: "Implementation", label: "Implementación" },
    { value: "Dependency", label: "Dependencia" },
  ];

  // Cuando se selecciona un nodo/edge, ajustamos la pestaña activa
  useEffect(() => {
    if (selectedNode) setActiveTab('node');
    if (selectedEdge) setActiveTab('edge');
  }, [selectedNode, selectedEdge]);

  // ==========================
  // LÓGICA DE VALIDACIONES EXTRA
  // ==========================
  const handleAddNode = () => {
    // Ejemplo: podrías evitar la creación si hay un "nodo fantasma" no guardado
    // o hacer otro tipo de validaciones. Aquí lo dejo simple:
    addNode();
  };

  // Evita que se guarde la clase si no tiene nombre
  const handleSaveNode = () => {
    if (!editingData?.className?.trim()) {
      alert('El nombre de la clase no puede estar vacío.');
      return;
    }
    // Podrías meter aquí checks más avanzados
    updateNodeData();
  };

  // Evita que se guarde la relación si no tiene "type"
  const handleSaveEdge = () => {
    if (!editingEdge?.type) {
      alert('El tipo de relación no puede estar vacío.');
      return;
    }
    // Ejemplo: Evitar que sea la misma clase => require source != target
    // (este check usualmente se haría al crear el edge en onConnect, 
    //  pero podrías duplicarlo aquí)
    updateEdgeData();
  };

  // ==========================
  // EDITOR DE NODOS (CLASES)
  // ==========================
  const renderNodeEditor = () => (
    <div className="card bg-white shadow-md p-4 rounded-lg animate-fadeIn">
      <h3 className="text-xl font-bold mb-4 text-gray-800 text-center">
        {editingData?.className || 'Nueva Clase'}
      </h3>

      {/* Nombre de la clase */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-1 text-gray-700">
          Nombre de la clase
        </label>
        <input
          type="text"
          name="className"
          value={editingData?.className || ''}
          onChange={handleInputChange}
          className="input-modern"
          placeholder="Ej. Persona"
        />
      </div>

      {/* Atributos */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-1 text-gray-700">
          Atributos
        </label>
        <textarea
          name="attributes"
          value={editingData?.attributes?.join("\n") || ''}
          onChange={(e) => handleArrayChange("attributes", e.target.value)}
          className="input-modern"
          rows="4"
          placeholder="+ nombre: string = ''"
        />
        <p className="text-xs text-gray-500 mt-1">
          Formato: <code>+ nombre: tipo = valor</code>  
        </p>
      </div>

      {/* Métodos */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-1 text-gray-700">
          Métodos
        </label>
        <textarea
          name="methods"
          value={editingData?.methods?.join("\n") || ''}
          onChange={(e) => handleArrayChange("methods", e.target.value)}
          className="input-modern"
          rows="4"
          placeholder="+ metodo(param): tipo"
        />
        <p className="text-xs text-gray-500 mt-1">
          Formato: <code>+ metodo(params): tipo</code>
        </p>
      </div>

      <button
        onClick={handleSaveNode}
        className="btn-primary w-full mt-2"
      >
        Guardar Clase
      </button>
    </div>
  );

  // ==========================
  // EDITOR DE ARISTAS (RELACIONES) - Versión mejorada
  // ==========================
  const renderEdgeEditor = () => {
    console.log('🎨 Renderizando editor de relaciones');
    console.log('🎨 selectedEdge:', selectedEdge);
    console.log('🎨 editingEdge:', editingEdge);

    if (!selectedEdge) {
      return (
        <div className="card bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <p className="text-yellow-800 text-center">
            ⚠️ No hay relación seleccionada
          </p>
          <p className="text-yellow-600 text-sm mt-2 text-center">
            Haz clic en una línea de conexión para editarla
          </p>
        </div>
      );
    }

    if (!editingEdge) {
      return (
        <div className="card bg-red-50 border border-red-200 p-4 rounded-lg">
          <p className="text-red-800 text-center">
            ❌ Error: No hay datos para editar
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-secondary mt-2 text-sm"
          >
            Recargar página
          </button>
        </div>
      );
    }

    return (
      <div className="card bg-white shadow-md p-4 rounded-lg animate-fadeIn border-l-4 border-blue-500">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            ✏️ Editar Relación
          </h3>
          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            ID: {selectedEdge.id?.substring(0, 8)}...
          </div>
        </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold mb-1 text-gray-700">
          Tipo de Relación
        </label>
        <select
          name="type"
          value={editingEdge?.type || "Association"}
          onChange={handleInputChangeEdge}
          className="select-modern"
        >
          {relationshipTypes.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Cardinalidad (sólo si es Association) */}
      {editingEdge?.type === "Association" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Cardinalidad Inicial
            </label>
            <select
              name="startLabel"
              value={editingEdge?.startLabel || ""}
              onChange={handleInputChangeEdge}
              className="select-modern"
            >
              <option value="">Ninguna</option>
              {cardinalityOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Cardinalidad Final
            </label>
            <select
              name="endLabel"
              value={editingEdge?.endLabel || ""}
              onChange={handleInputChangeEdge}
              className="select-modern"
            >
              <option value="">Ninguna</option>
              {cardinalityOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>
      )}

        {/* Información adicional del edge */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-600 space-y-1">
            <div><strong>Desde:</strong> {selectedEdge.source}</div>
            <div><strong>Hacia:</strong> {selectedEdge.target}</div>
            <div><strong>Tipo actual:</strong> {editingEdge.type}</div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSaveEdge}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            💾 Guardar
          </button>
          <button
            onClick={() => {
              setSelectedEdge(null);
              setEditingEdge(null);
            }}
            className="btn-secondary px-3"
            title="Cancelar edición"
          >
            ❌
          </button>
        </div>
      </div>
    );
  };

  // ==========================
  // RENDER PRINCIPAL DEL SIDEBAR
  // ==========================
  return (
    <div
      className={`
        bg-gradient-to-br from-white to-gray-50
        border-r border-gray-200
        relative transition-all duration-300
        flex flex-col shadow-inner
        ${isCollapsed ? 'w-16' : 'w-80'}
      `}
      style={{ minHeight: 'calc(100vh - 4rem)' }}
    >
      {/* Botón para colapsar/expandir */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`
          absolute -right-4 top-5 z-10 p-1
          rounded-full shadow bg-white border border-gray-300
          flex items-center justify-center
          transition-transform hover:scale-105
        `}
      >
        {isCollapsed ? (
          <ChevronRightIcon className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {/* Contenido visible si NO está colapsado */}
      {!isCollapsed && (
        <div className="p-4 space-y-6">
          {/* Botón "Nueva Clase" */}
          <button
            onClick={handleAddNode}
            className="btn-primary flex items-center gap-2 w-full"
          >
            <PlusCircleIcon className="w-5 h-5" />
            Nueva Clase
          </button>

          {/* Si hay un nodo o arista seleccionado, mostramos el editor */}
          {(selectedNode || selectedEdge) && (
            <div>
              {/* Tabs "Clase" / "Relación" */}
              <div className="flex justify-center space-x-2 mb-4">
                <button
                  onClick={() => setActiveTab('node')}
                  className={`
                    flex-1 py-2 rounded-md font-semibold text-sm transition-colors
                    ${activeTab === 'node'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }
                  `}
                  disabled={!selectedNode}
                >
                  Clase
                </button>
                <button
                  onClick={() => setActiveTab('edge')}
                  className={`
                    flex-1 py-2 rounded-md font-semibold text-sm transition-colors
                    ${activeTab === 'edge'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }
                  `}
                  disabled={!selectedEdge}
                >
                  Relación
                </button>
              </div>

              {/* Renderizado condicional según la pestaña activa */}
              {activeTab === 'node' && selectedNode && renderNodeEditor()}
              {activeTab === 'edge' && selectedEdge && renderEdgeEditor()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(LeftSidebar);
