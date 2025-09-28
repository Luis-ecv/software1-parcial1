import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, getDocs, getDoc, deleteDoc, doc, updateDoc, query, where } from "firebase/firestore";
import { db } from "../firebase-confing/Firebase";
import { getAuth } from "firebase/auth";
import Swal from "sweetalert2";
import BoardList from "../components/board/BoardList";
import BoardModals from "../components/board/BoardModals";

const useBoardState = () => {
  const [description, setDescription] = useState("");
  const [boardList, setBoardList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentBoardId, setCurrentBoardId] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);
  const [inviteModalIsOpen, setInviteModalIsOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [xmlContent, setXmlContent] = useState(""); // Nuevo estado para XML

  return {
    description,
    setDescription,
    boardList,
    setBoardList,
    loading,
    setLoading,
    currentBoardId,
    setCurrentBoardId,
    modalIsOpen,
    setModalIsOpen,
    editModalIsOpen,
    setEditModalIsOpen,
    inviteModalIsOpen,
    setInviteModalIsOpen,
    inviteEmail,
    setInviteEmail,
    xmlContent,      // Añadir estas
    setXmlContent    // dos líneas
  };
};

const Board = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const boardCollection = collection(db, "board");

  const [user, setUser] = useState(null);
  const boardState = useBoardState();
  const {
    description,
    setDescription,
    boardList,
    setBoardList,
    loading,
    setLoading,
    currentBoardId,
    setCurrentBoardId,
    modalIsOpen,
    setModalIsOpen,
    editModalIsOpen,
    setEditModalIsOpen,
    inviteModalIsOpen,
    setInviteModalIsOpen,
    inviteEmail,
    setInviteEmail,
    xmlContent,        // Añadir estas
    setXmlContent     // dos líneas
  } = boardState;


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        setLoading(false);
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [auth, navigate]);

  const getBoardList = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const q = query(
        collection(db, "board"),
        where("participantes", "array-contains", user.email)
      );
      const data = await getDocs(q);
      setBoardList(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    } catch (error) {
      console.error("Error al obtener tableros:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los tableros",
      });
    } finally {
      setLoading(false);
    }
  }, [user, setBoardList]);

  useEffect(() => {
    if (user) {
      getBoardList();
    }
  }, [getBoardList, user]);

  useEffect(() => {
    if (xmlContent && user) {
      getBoardList();
    }
  }, [xmlContent, getBoardList, user]);




  // Modal actions
  const closeAllModals = useCallback(() => {
    setModalIsOpen(false);
    setEditModalIsOpen(false);
    setInviteModalIsOpen(false);
    setDescription("");
    setInviteEmail("");
  }, [setModalIsOpen, setEditModalIsOpen, setInviteModalIsOpen, setDescription, setInviteEmail]);

  // CRUD operations
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "El nombre del tablero es obligatorio",
      });
      return;
    }

    try {
      await addDoc(boardCollection, {
        description,
        host: user.email,
        participantes: [user.email],
        createdAt: new Date(),
      });

      await getBoardList();
      closeAllModals();

      Swal.fire({
        icon: "success",
        title: "¡Tablero creado!",
        text: "Tu tablero ha sido agregado exitosamente",
      });
    } catch (error) {
      console.error("Error al crear tablero:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo crear el tablero",
      });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "El nombre del tablero es obligatorio",
      });
      return;
    }

    try {
      const boardRef = doc(db, "board", currentBoardId);
      await updateDoc(boardRef, {
        description,
        updatedAt: new Date(),
      });

      await getBoardList();
      closeAllModals();

      Swal.fire({
        icon: "success",
        title: "¡Tablero actualizado!",
        text: "Tu tablero ha sido editado exitosamente",
      });
    } catch (error) {
      console.error("Error al editar tablero:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo editar el tablero",
      });
    }
  };

  const handleInviteUser = async (email) => {
    if (!email || !currentBoardId) return;

    try {
      const boardRef = doc(db, "board", currentBoardId);
      const boardDoc = await getDoc(boardRef);

      if (!boardDoc.exists()) {
        throw new Error("El tablero no existe");
      }

      const currentParticipants = boardDoc.data().participantes || [];

      if (currentParticipants.includes(email)) {
        Swal.fire({
          icon: "warning",
          title: "Usuario ya invitado",
          text: "Este usuario ya tiene acceso al tablero",
        });
        return;
      }

      await updateDoc(boardRef, {
        participantes: [...currentParticipants, email]
      });

      Swal.fire({
        icon: "success",
        title: "¡Usuario invitado!",
        text: "El usuario ha sido invitado exitosamente",
      });

      closeAllModals();
    } catch (error) {
      console.error("Error al invitar usuario:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo invitar al usuario",
      });
    }
  };

  const handleDeleteBoard = async (boardId) => {
    try {
      const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: "No podrás revertir esta acción",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
      });

      if (result.isConfirmed) {
        await deleteDoc(doc(db, "board", boardId));
        await getBoardList();

        Swal.fire(
          "¡Eliminado!",
          "El tablero ha sido eliminado.",
          "success"
        );
      }
    } catch (error) {
      console.error("Error al eliminar tablero:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo eliminar el tablero",
      });
    }
  };

  const handleCopyLink = (boardId) => {
    const link = `${window.location.origin}/board/${boardId}`;
    navigator.clipboard.writeText(link);
    Swal.fire({
      icon: "success",
      title: "¡Enlace copiado!",
      text: "El enlace ha sido copiado al portapapeles",
      timer: 2000,
      showConfirmButton: false
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  // Manejar la carga del archivo XML
  const handleXmlUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      processXml(content);
    };
    reader.readAsText(file);
  };
  // Procesar el archivo XML
  const processXml = (xmlText) => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
  
      const parserError = xmlDoc.querySelector("parsererror");
      if (parserError) {
        throw new Error("Error al parsear el XML: " + parserError.textContent);
      }
  
      console.log("XML parseado:", xmlDoc);
  
      // Buscar todos los elementos packagedElement y filtrar
      const allPackaged = xmlDoc.getElementsByTagName("packagedElement");
      let classes = [];
  
      // Intentar encontrar clases dentro de paquetes
      for (let el of allPackaged) {
        if (el.getAttribute("xmi:type") === "uml:Package") {
          const pkgElements = el.getElementsByTagName("packagedElement");
          for (let child of pkgElements) {
            if (child.getAttribute("xmi:type") === "uml:Class") {
              classes.push(child);
            }
          }
        }
      }
  
      // Si no se encontraron clases en paquetes, buscar globalmente
      if (classes.length === 0) {
        for (let el of allPackaged) {
          if (el.getAttribute("xmi:type") === "uml:Class") {
            classes.push(el);
          }
        }
      }
  
      console.log("Clases encontradas:", classes.length);
  
      if (classes.length === 0) {
        throw new Error("No se encontraron clases en el XML");
      }
  
      const parsedNodes = classes.map((cls, index) => {
        const id = cls.getAttribute("xmi:id");
        const name = cls.getAttribute("name");
      
        // Espaciado mejorado entre nodos
        const position = {
          x: 250 + (index * 300), // Aumentado el espaciado horizontal
          y: 150 + (Math.floor(index / 2) * 250) // Distribución en filas
        };
      
        return {
          id: `node-${id}`,
          type: "classNode",
          position,
          data: {
            className: name,
            attributes: ["nuevoAtributo: string"],
            methods: ["nuevoMetodo(): void"]
          },
          dragging: false,
          selected: false,
          measured: {
            height: 186,
            width: 220
          }
        };
      });
      
      // Mejorar el procesamiento de relaciones
      const edges = [];
      
      // Procesar asociaciones y agregaciones
      const associations = Array.from(allPackaged).filter(el => {
        return el.getAttribute("xmi:type") === "uml:Association";
      });
      
      

      associations.forEach((assoc, index) => {
        const memberEnds = assoc.getElementsByTagName("ownedEnd");
        
        if (memberEnds.length === 2) {
          const source = memberEnds[0].getAttribute("type");
          const target = memberEnds[1].getAttribute("type");
          
          if (source && target) {
            // Solo ahora agrega a edges
          } else {
            console.error(`Relación inválida encontrada en el XML.`);
          }
        }
      });
            
      console.log("Relaciones encontradas:", edges.length);
      
      // Modificar la descripción del tablero importado
      const newBoardDescription = `Diagrama UML - ${parsedNodes[0].data.className} (${new Date().toLocaleDateString()})`;
      
      createBoardFromXml(newBoardDescription, parsedNodes, edges);
  
    } catch (error) {
      console.error("Error procesando XML:", error);
      Swal.fire({
        icon: "error",
        title: "Error al procesar el XML",
        text: error.message,
        showConfirmButton: true
      });
    }
  };
  // Crear el tablero con los datos procesados
  const createBoardFromXml = async (description, nodes, edges) => {
    try {
      // Crear el nuevo tablero con todos los datos necesarios
      await addDoc(boardCollection, {
        description,
        nodes,
        edges,
        host: user.email,
        participantes: [user.email],
        createdAt: new Date(),
        updatedAt: new Date()
      });
  
      Swal.fire({
        icon: "success",
        title: "¡Tablero creado!",
        text: `El tablero "${description}" ha sido importado correctamente`,
        showConfirmButton: false,
        timer: 2000
      });
  
      await getBoardList();
    } catch (error) {
      console.error("Error al crear el tablero:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo crear el tablero"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header con título y botones principales */}
        <div className="header-container">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Mis Tableros
          </h1>

          <div className="flex items-center gap-3">
            {/* Botón importar XML */}
            <label
              htmlFor="fileInput"
              className="btn-success cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Importar XML
            </label>
            <input
              type="file"
              id="fileInput"
              accept=".xml"
              onChange={handleXmlUpload}
              className="hidden"
            />

            {/* Botón nuevo tablero */}
            <button
              onClick={() => setModalIsOpen(true)}
              className="btn-primary"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Tablero
            </button>
          </div>
        </div>

        {/* Contenedor principal de la lista de tableros */}
        <div className="card-container">
          <BoardList
            boards={boardList}
            user={user}
            onInvite={(id) => {
              setCurrentBoardId(id);
              setInviteModalIsOpen(true);
            }}
            onEdit={(board) => {
              setDescription(board.description);
              setCurrentBoardId(board.id);
              setEditModalIsOpen(true);
            }}
            onDelete={handleDeleteBoard}
          />
        </div>

        {/* Modales */}
        <BoardModals
          modalStates={{ modalIsOpen, editModalIsOpen, inviteModalIsOpen }}
          modalActions={{
            closeModal: () => setModalIsOpen(false),
            closeEditModal: () => setEditModalIsOpen(false),
            closeInviteModal: () => setInviteModalIsOpen(false)
          }}
          description={description}
          setDescription={setDescription}
          inviteEmail={inviteEmail}
          setInviteEmail={setInviteEmail}
          handleSubmit={handleSubmit}
          handleEditSubmit={handleEditSubmit}
          handleInviteUser={handleInviteUser}
          handleCopyLink={handleCopyLink}
          currentBoardId={currentBoardId}
        />
      </div>
    </div>
  );
};

export default Board;