// BoardPage.jsx
import React, { useCallback } from "react";
import {
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  addEdge
} from "@xyflow/react";
import { useParams } from "react-router-dom";
import { db } from "../firebase-confing/Firebase";
import {
  nodeTypes,
  edgeTypes,
  defaultEdgeOptions,
} from '../config/flowConfig';
import { getAuth } from "firebase/auth";
import useFirebaseFlow from '../config/useFirebaseFlow';
import LeftSidebar from "../components/control/Sidebar"; 
import Swal from 'sweetalert2';
import { buildExportXML } from '../utils/myCustomXmlFunctions';
import { generateCode } from '../utils/codeGenerator';
import { verifyUMLDiagramWithAI, validateAICredentials } from '../utils/aiUMLValidator';
import BurbujaHerramientasDiagrama from '../components/BurbujaHerramientasDiagrama';
import JSZip from 'jszip'
import { saveAs } from 'file-saver';


const BoardPage = () => {
  const { id: boardId } = useParams();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const {
    nodes,
    edges,
    activeUsers,
    participantes,
    selectedNode,
    selectedEdge,
    editingData,
    editingEdge,
    onNodesChange,
    onEdgesChange,
    addNode,
    handleNodeSelection,
    handleEdgeSelection,
    updateNodeData,
    updateEdgeData,
    setEditingData,
    setEditingEdge,
    updateBoardData,
    setNodes,
    setEdges
  } = useFirebaseFlow(boardId, db, currentUser);

  const ActiveUsers = ({ users }) => (
    <div className="flex flex-wrap gap-2">
      {users.map((user, index) => (
        <div
          key={index}
          className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs flex items-center"
        >
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          {user}
        </div>
      ))}
    </div>
  );

  // Función para verificar diagrama UML con IA
  const handleVerifyDiagramAI = async () => {
    try {
      // Validar que hay un diagrama para verificar
      if (!nodes.length) {
        Swal.fire({
          icon: 'info',
          title: 'Diagrama vacío',
          text: 'No hay clases en el diagrama para verificar.'
        });
        return;
      }

      // Validar credenciales de IA
      const credentialsCheck = validateAICredentials();
      if (!credentialsCheck.valid) {
        Swal.fire({
          icon: 'error',
          title: 'Configuración faltante',
          html: `<div class="text-left">
            <p>No se pudo conectar con la IA:</p>
            <p class="text-sm text-gray-600 mt-2">${credentialsCheck.message}</p>
            <br>
            <p class="text-sm"><strong>Para configurar:</strong></p>
            <ol class="text-sm text-left list-decimal pl-4">
              <li>Crea un archivo <code>.env</code> en la raíz del proyecto</li>
              <li>Agrega: <code>VITE_GEMINI_API_KEY=tu_clave_aqui</code></li>
              <li>Reinicia la aplicación</li>
            </ol>
          </div>`,
          confirmButtonText: 'Entendido'
        });
        return;
      }

      // Mostrar indicador de carga
      Swal.fire({
        title: 'Verificando con IA...',
        html: `
          <div class="text-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Enviando diagrama a la IA para análisis experto</p>
            <p class="text-sm text-gray-500 mt-2">Esto puede tomar unos segundos...</p>
          </div>
        `,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        willOpen: () => {
          // Opcional: agregar más animaciones personalizadas
        }
      });

      // Llamar a la IA para verificación
      const resultado = await verifyUMLDiagramWithAI(nodes, edges, boardId, 'GEMINI', true);

      // Formatear y mostrar resultados
      const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
      };

      const getScoreIcon = (score) => {
        if (score >= 80) return '🎉';
        if (score >= 60) return '⚠️';
        return '❌';
      };

      let htmlContent = `
        <div class="text-left max-h-96 overflow-y-auto">
          <div class="text-center mb-4">
            <div class="text-4xl mb-2">${getScoreIcon(resultado.scoreDiseno)}</div>
            <div class="text-2xl font-bold mb-2">
              <span class="${getScoreColor(resultado.scoreDiseno)}">Score: ${resultado.scoreDiseno}/100</span>
            </div>
            <div class="text-sm ${resultado.okEstructural ? 'text-green-600' : 'text-red-600'}">
              ${resultado.okEstructural ? '✅ Estructura correcta' : '❌ Problemas estructurales'}
            </div>
          </div>`;

      // Problemas estructurales
      if (!resultado.okEstructural) {
        htmlContent += `<div class="mb-4 p-3 bg-red-50 rounded">
          <h4 class="font-semibold text-red-700 mb-2">Problemas Estructurales:</h4>`;
        
        if (resultado.islas?.length > 0) {
          htmlContent += `<p class="text-sm mb-1"><strong>Nodos aislados:</strong> ${resultado.islas.join(', ')}</p>`;
        }
        
        if (resultado.referenciasRotas?.length > 0) {
          htmlContent += `<p class="text-sm mb-1"><strong>Referencias rotas:</strong> ${resultado.referenciasRotas.length}</p>`;
        }
        
        if (resultado.ciclosHerencia?.length > 0) {
          htmlContent += `<p class="text-sm mb-1"><strong>Ciclos de herencia:</strong> ${resultado.ciclosHerencia.length}</p>`;
        }
        
        htmlContent += `</div>`;
      }

      // Acciones prioritarias
      if (resultado.accionesPrioritarias?.length > 0) {
        htmlContent += `
          <div class="mb-4">
            <h4 class="font-semibold text-orange-700 mb-2">🔥 Acciones Prioritarias:</h4>
            <ul class="text-sm space-y-1">
              ${resultado.accionesPrioritarias.map((accion, idx) => 
                `<li class="flex items-start gap-2">
                  <span class="text-orange-600 font-bold">${idx + 1}.</span>
                  <span>${accion}</span>
                </li>`
              ).join('')}
            </ul>
          </div>`;
      }

      // Sugerencias
      if (resultado.sugerencias?.length > 0) {
        htmlContent += `
          <div class="mb-4">
            <h4 class="font-semibold text-blue-700 mb-2">💡 Sugerencias:</h4>
            <ul class="text-sm space-y-1">
              ${resultado.sugerencias.map(sugerencia => 
                `<li class="flex items-start gap-2">
                  <span class="text-blue-600">•</span>
                  <span>${sugerencia}</span>
                </li>`
              ).join('')}
            </ul>
          </div>`;
      }

      // Tags
      if (resultado.tags?.length > 0) {
        htmlContent += `
          <div class="mb-4">
            <h4 class="font-semibold mb-2">🏷️ Aspectos Analizados:</h4>
            <div class="flex flex-wrap gap-1">
              ${resultado.tags.map(tag => 
                `<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">${tag}</span>`
              ).join('')}
            </div>
          </div>`;
      }

      // Limitaciones
      if (resultado.limitaciones?.length > 0) {
        htmlContent += `
          <div class="mb-2">
            <h4 class="font-semibold text-gray-600 mb-2">ℹ️ Limitaciones:</h4>
            <ul class="text-xs text-gray-600 space-y-1">
              ${resultado.limitaciones.map(limitacion => 
                `<li>• ${limitacion}</li>`
              ).join('')}
            </ul>
          </div>`;
      }

      htmlContent += `
        <div class="mt-4 pt-3 border-t text-center">
          <p class="text-xs text-gray-500">Análisis realizado por IA • ${new Date().toLocaleString()}</p>
        </div>
      </div>`;

      // Mostrar resultado final
      Swal.fire({
        icon: resultado.okEstructural && resultado.scoreDiseno >= 80 ? 'success' : 
               resultado.scoreDiseno >= 60 ? 'warning' : 'error',
        title: 'Verificación IA Completada',
        html: htmlContent,
        width: '700px',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#3085d6',
        customClass: {
          htmlContainer: 'text-left'
        }
      });

      // Log para debugging
      console.log('🤖 Resultado verificación IA:', resultado);

    } catch (error) {
      console.error('Error en verificación con IA:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        html: `
          <div class="text-left">
            <p>No se pudo completar la verificación con IA:</p>
            <p class="text-sm text-red-600 mt-2">${error.message}</p>
            <br>
            <p class="text-sm text-gray-600">
              Verifica tu conexión a internet y que la clave API esté configurada correctamente.
            </p>
          </div>
        `,
        confirmButtonText: 'Reintentar'
      });
    }
  };

  // Función para exportar a XMI (usando buildExportXML)
  const handleExportXMI = async () => {
    try {
      if (!nodes.length) {
        Swal.fire({
          icon: 'warning',
          title: 'Diagrama vacío',
          text: 'No hay clases en el diagrama para exportar.'
        });
        return;
      }

      Swal.fire({
        title: 'Generando XML...',
        text: 'Por favor, espera',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        willOpen: () => Swal.showLoading()
      });

      const xmlContent = buildExportXML(nodes, edges);

      const opts = {
        suggestedName: `diagram_${boardId}.xml`,
        types: [
          {
            description: 'XMI Files',
            accept: { 'text/xml': ['.xml'] },
          },
        ],
      };

      const handle = await window.showSaveFilePicker(opts);
      const writable = await handle.createWritable();
      await writable.write(xmlContent);
      await writable.close();

      Swal.close();
      Swal.fire({
        icon: 'success',
        title: '¡Exportación exitosa!',
        text: 'Archivo XMI guardado correctamente.',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error exportando el XMI:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al exportar',
        text: error.message || 'No se pudo exportar el diagrama'
      });
    }
  };
  const handleGenerateCode = async (fullStack = false) => {
    try {
      const code = generateCode(nodes, edges, fullStack);
  
      if (!fullStack) {
        // Descarga solo los modelos en un único archivo .java
        const allModelsCode = code.models.map(m => m.code).join('\n\n');
        const blob = new Blob([allModelsCode], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'models.java';
        a.click();
        return;
      }
  
      // ================ FULL STACK: Generar carpeta con 4 capas en un ZIP ================
      const zip = new JSZip();
  
      // 1) Crear carpeta 'models' y agregar archivos
      const modelsFolder = zip.folder('models');
      code.models.forEach(({ className, code: fileCode }) => {
        const fileName = `${className}.java`;
        modelsFolder.file(fileName, fileCode);
      });
  
      // 2) Crear carpeta 'repositories' y agregar archivos
      const reposFolder = zip.folder('repositories');
      code.repositories.forEach(({ className, code: fileCode }) => {
        const fileName = `${className}Repository.java`;
        reposFolder.file(fileName, fileCode);
      });
  
      // 3) Crear carpeta 'services' y agregar archivos
      const servicesFolder = zip.folder('services');
      code.services.forEach(({ className, code: fileCode }) => {
        const fileName = `${className}Service.java`;
        servicesFolder.file(fileName, fileCode);
      });
  
      // 4) Crear carpeta 'controllers' y agregar archivos
      const controllersFolder = zip.folder('controllers');
      code.controllers.forEach(({ className, code: fileCode }) => {
        const fileName = `${className}Controller.java`;
        controllersFolder.file(fileName, fileCode);
      });
  
      // Finalmente, generamos el zip y lo descargamos
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'spring-boot-project.zip');
  
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error generando código',
        text: error.message
      });
    }
  };
  // onConnect para crear aristas por defecto - Versión mejorada
  const onConnect = useCallback(
    (params) => {
      console.log('🔗 Creando nueva relación:', params);
      
      if (!params.source || !params.target) {
        console.warn('⚠️ Error: source o target faltante', params);
        return;
      }

      // Prevenir auto-conexiones
      if (params.source === params.target) {
        Swal.fire({
          icon: 'warning',
          title: 'Conexión inválida',
          text: 'No puedes conectar una clase consigo misma',
          timer: 2000
        });
        return;
      }

      // Verificar si ya existe una conexión entre estos nodos
      const existingEdge = edges.find(edge => 
        (edge.source === params.source && edge.target === params.target) ||
        (edge.source === params.target && edge.target === params.source)
      );

      if (existingEdge) {
        Swal.fire({
          icon: 'info',
          title: 'Conexión existente',
          text: 'Ya existe una relación entre estas clases',
          timer: 2000
        });
        return;
      }

      // Crear edge con datos completos y ID único
      const newEdge = {
        id: `edge-${Date.now()}-${params.source}-${params.target}`,
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle || 'right',
        targetHandle: params.targetHandle || 'left',
        type: 'umlEdge',
        animated: false,
        data: {
          type: 'Association',
          startLabel: '',
          endLabel: '',
          label: '',
          sourceRole: '',
          targetRole: '',
          selected: false
        }
      };

      console.log('✅ Edge creado exitosamente:', newEdge);

      const updatedEdges = addEdge(newEdge, edges);
      setEdges(updatedEdges);
      updateBoardData(updatedEdges, "edges");

      // Auto-seleccionar el edge recién creado para edición
      setTimeout(() => {
        handleEdgeSelection(newEdge);
      }, 100);
    },
    [edges, setEdges, updateBoardData, handleEdgeSelection]
  );

  // Manejadores de edición...
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInputChangeEdge = useCallback((event) => {
    const { name, value } = event.target;
    setEditingEdge((prev) => ({
      ...prev,
      [name]: value
    }));
  }, [setEditingEdge]);

  const handleArrayChange = (name, value) => {
    setEditingData((prev) => ({
      ...prev,
      [name]: value.split("\n"),
    }));
  };

  return (
  <div className="flex h-[calc(100vh-4rem)]">
    {/* Sidebar a la izquierda */}
    <LeftSidebar
      addNode={addNode}
      selectedNode={selectedNode}
      selectedEdge={selectedEdge}
      editingData={editingData}
      editingEdge={editingEdge}
      handleInputChange={handleInputChange}
      handleArrayChange={handleArrayChange}
      handleInputChangeEdge={handleInputChangeEdge}
      updateNodeData={updateNodeData}
      updateEdgeData={updateEdgeData}
    />

    {/* Contenido principal a la derecha */}
    <div className="flex-1 flex flex-col">
      {/* Barra superior con botones y usuarios activos */}
      <div className="flex items-center justify-between p-2 bg-white border-b">
        <div className="flex items-center space-x-4">
          {/* Botón de verificación UML con IA */}
          <button
            onClick={handleVerifyDiagramAI}
            className="btn-primary bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-md hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
          >
            Verificar Diagrama
          </button>

          {/* Botón de exportación */}
          <button
            onClick={handleExportXMI}
            className="btn-secondary bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:from-purple-700 hover:to-indigo-700"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Exportar para EA
          </button>

          {/* Botón de generación Full Stack */}
          <button
            onClick={() => handleGenerateCode(true)}
            className="btn-secondary bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:from-purple-700 hover:to-indigo-700"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Full Stack
          </button>

          {/* Usuarios activos */}
          <ActiveUsers users={activeUsers} />
        </div>

        {/* Lista de participantes */}
        <div className="flex gap-2">
          {participantes.map((p, idx) => (
            <span
              key={`participante-${idx}`}
              className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs"
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* React Flow (Diagrama) */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_, node) => handleNodeSelection(node)}
          onEdgeClick={(_, edge) => handleEdgeSelection(edge)}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
          className="bg-gray-50"
        >
          <Background color="#e0e7ff" gap={20} />
          <Controls className="bg-white shadow-md" />
        </ReactFlow>
      </div>
      
      {/* Burbuja de herramientas */}
      <BurbujaHerramientasDiagrama
        nodes={nodes}
        edges={edges}
        setNodes={setNodes}
        setEdges={setEdges}
        selectedNodeIds={selectedNode ? [selectedNode.id] : []}
        selectedEdgeIds={selectedEdge ? [selectedEdge.id] : []}
        boardId={boardId}
        db={db}
        userEmail={currentUser?.email}
      />
    </div>
  </div>
);

};

// Wrapper con provider
export default function BoardPageWrapper() {
  return (
    <ReactFlowProvider>
      <BoardPage />
    </ReactFlowProvider>
  );
}
