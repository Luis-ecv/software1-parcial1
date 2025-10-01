import { useState, useCallback, useEffect } from 'react';
import { onSnapshot, doc, updateDoc, getDoc } from "firebase/firestore";
import { applyNodeChanges, applyEdgeChanges } from '@xyflow/react';

export const useFirebaseFlow = (boardId, db, currentUser) => {
  // Estados básicos
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [participantes, setParticipantes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [editingEdge, setEditingEdge] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Efecto para sincronización en tiempo real
  useEffect(() => {
    if (!boardId || !db) return;

    const boardRef = doc(db, "board", boardId);
    
    const loadInitialData = async () => {
      try {
        const docSnap = await getDoc(boardRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.nodes) setNodes(data.nodes);
          if (data.edges) setEdges(data.edges);
          if (data.participantes) setParticipantes(data.participantes);
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const unsubscribe = onSnapshot(boardRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.nodes) setNodes(data.nodes);
        if (data.edges) setEdges(data.edges);
        if (data.participantes) setParticipantes(data.participantes);
        if (data.activeUsers) setActiveUsers(data.activeUsers || []);
      }
    });

    loadInitialData();
    return () => unsubscribe();
  }, [boardId, db]);

  // Función para actualizar datos en Firebase
  const updateBoardData = useCallback(async (updatedData, key) => {
    if (!boardId) return;
    
    try {
      const boardRef = doc(db, "board", boardId);
      await updateDoc(boardRef, { 
        [key]: updatedData,
        lastModified: new Date().toISOString(),
        lastModifiedBy: currentUser?.email
      });
    } catch (error) {
      console.error(`Error updating ${key}:`, error);
    }
  }, [boardId, db, currentUser]);

  // Manejo de cambios en nodos
  const onNodesChange = useCallback(async (changes) => {
    const updatedNodes = applyNodeChanges(changes, nodes);
    setNodes(updatedNodes);
    
    const significantChanges = changes.some(change => 
      change.type === 'position' || 
      change.type === 'remove' || 
      change.type === 'add' ||
      change.type === 'reset'
    );

    if (significantChanges) {
      await updateBoardData(updatedNodes, "nodes");
    }
  }, [nodes, updateBoardData]);

  // Manejo de cambios en edges
  const onEdgesChange = useCallback(async (changes) => {
    const updatedEdges = applyEdgeChanges(changes, edges);
    setEdges(updatedEdges);
    await updateBoardData(updatedEdges, "edges");
  }, [edges, updateBoardData]);

  // Función para añadir nodos
const addNode = useCallback(async (nodeType = "classNode", customData = {}) => {
  let newNode;
  
  if (nodeType === "noteNode") {
    // Crear nodo de nota
    newNode = {
      id: `note-${Date.now()}`,
      position: { x: Math.random() * 300 + 100, y: Math.random() * 300 + 100 },
      type: "noteNode",
      data: {
        text: customData.text || 'Nueva nota...\nHaz clic para editar',
        isNote: true,
        ...customData
      },
    };
  } else {
    // Crear nodo de clase (comportamiento original)
    const sanitizedClassName = `Clase${nodes.filter(n => n.type === 'classNode').length + 1}`;
    newNode = {
      id: `node-${Date.now()}`,
      position: { x: Math.random() * 300 + 100, y: Math.random() * 300 + 100 },
      type: "classNode",
      data: {
        className: sanitizedClassName,
        attributes: ["nuevoAtributo: string"],
        methods: ["nuevoMetodo(): void"],
        ...customData
      },
    };
  }

  const updatedNodes = [...nodes, newNode];
  setNodes(updatedNodes);
  await updateBoardData(updatedNodes, "nodes");
}, [nodes, updateBoardData]);

  
  // Manejo de usuarios activos
  const updateActiveUsers = useCallback(async () => {
    if (!boardId || !currentUser) return;

    const boardRef = doc(db, "board", boardId);
    const boardDoc = await getDoc(boardRef);

    if (!boardDoc.exists()) return;

    const activeUsersData = boardDoc.data().activeUsers || [];
    if (!activeUsersData.includes(currentUser.email)) {
      const updatedUsers = [...activeUsersData, currentUser.email];
      await updateDoc(boardRef, {
        activeUsers: updatedUsers
      });
    }
  }, [boardId, currentUser, db]);

  // Limpieza de usuarios al salir
  const cleanupActiveUser = useCallback(async () => {
    if (!boardId || !currentUser) return;

    const boardRef = doc(db, "board", boardId);
    const boardDoc = await getDoc(boardRef);

    if (!boardDoc.exists()) return;

    const activeUsersData = boardDoc.data().activeUsers || [];
    const updatedUsers = activeUsersData.filter(email => email !== currentUser.email);

    await updateDoc(boardRef, {
      activeUsers: updatedUsers
    });
  }, [boardId, currentUser, db]);

  // Efecto para manejar usuarios activos
  useEffect(() => {
    updateActiveUsers();

    const boardRef = doc(db, "board", boardId);
    const unsubscribe = onSnapshot(boardRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setActiveUsers(data.activeUsers || []);
      }
    });

    return () => {
      cleanupActiveUser();
      unsubscribe();
    };
  }, [boardId, currentUser, updateActiveUsers, cleanupActiveUser]);

  return {
    nodes,
    edges,
    participantes,
    selectedNode,
    selectedEdge,
    editingData,
    editingEdge,
    activeUsers,
    isLoading,
    onNodesChange,
    onEdgesChange,
    addNode,
    handleNodeSelection: (node) => {
      setSelectedNode(node);
      setEditingData({ ...node.data });
    },
    handleEdgeSelection: (edge) => {
      console.log('🎯 Edge seleccionado:', edge);
      console.log('🎯 Edge data:', edge.data);
      
      // Limpiar selección de nodos
      setSelectedNode(null);
      setEditingData(null);
      
      // Establecer selección de edge
      setSelectedEdge(edge);
      
      // Asegurar que edge.data tiene estructura completa
      const completeEdgeData = {
        type: 'Association',
        startLabel: '',
        endLabel: '',
        label: '',
        sourceRole: '',
        targetRole: '',
        selected: true,
        ...edge.data // Sobrescribir con datos existentes
      };
      
      setEditingEdge(completeEdgeData);
      console.log('✅ EditingEdge actualizado:', completeEdgeData);
      
      // Marcar visualmente el edge como seleccionado
      const updatedEdges = edges.map(e => ({
        ...e,
        data: {
          ...e.data,
          selected: e.id === edge.id
        }
      }));
      setEdges(updatedEdges);
    },
    updateNodeData: async () => {
      if (!selectedNode) return;
    
      const sanitizedClassName = editingData.className.replace(/\s+/g, "_"); // Eliminar espacios
      const updatedNodes = nodes.map(node =>
        node.id === selectedNode.id
          ? { ...node, data: { ...editingData, className: sanitizedClassName } }
          : node
      );
    
      setNodes(updatedNodes);
      await updateBoardData(updatedNodes, "nodes");
      setSelectedNode(null);
    },
    
    updateEdgeData: async () => {
      console.log('💾 Guardando cambios de edge...');
      console.log('💾 selectedEdge:', selectedEdge);
      console.log('💾 editingEdge:', editingEdge);
      
      if (!selectedEdge || !editingEdge) {
        console.warn('⚠️ No hay edge seleccionado o datos para guardar');
        return;
      }

      try {
        // Crear datos actualizados sin el campo 'selected'
        const { selected, ...cleanEdgeData } = editingEdge;
        
        const updatedEdges = edges.map(edge => {
          if (edge.id === selectedEdge.id) {
            return { 
              ...edge, 
              data: {
                ...cleanEdgeData,
                selected: false // Desmarcar después de guardar
              }
            };
          }
          return {
            ...edge,
            data: {
              ...edge.data,
              selected: false // Desmarcar todos los demás
            }
          };
        });

        console.log('💾 Edges actualizados:', updatedEdges);
        
        setEdges(updatedEdges);
        await updateBoardData(updatedEdges, "edges");
        
        // Limpiar selección
        setSelectedEdge(null);
        setEditingEdge(null);
        
        console.log('✅ Edge guardado exitosamente');
      } catch (error) {
        console.error('❌ Error guardando edge:', error);
      }
    },
    setEditingData,
    setEditingEdge,
    setSelectedEdge,
    updateBoardData,
    setNodes,
    setEdges,
    updateActiveUsers,
    cleanupActiveUser
  };
};

export default useFirebaseFlow;