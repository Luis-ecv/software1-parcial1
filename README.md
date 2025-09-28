# 🎯 Diagramador UML - Software 1 Parcial 1

**Aplicación web para crear y gestionar diagramas UML con validación mediante Inteligencia Artificial**

![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5+-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-9+-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3+-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)

## ✨ Características Principales

### 🎨 **Diagramador Interactivo**
- **Canvas dinámico** con React Flow para crear diagramas UML
- **Drag & Drop** intuitivo para clases y relaciones
- **Edición en tiempo real** de propiedades y métodos
- **Múltiples tipos de relaciones** (herencia, composición, agregación, etc.)

### 🤖 **Validación con IA**
- **Gemini 2.5 Flash** para análisis experto de diagramas
- **Validación estructural** automática
- **Detección de errores** y sugerencias de mejora
- **Reportes JSON** detallados con recomendaciones

### 🔥 **Colaboración en Tiempo Real**
- **Firebase Firestore** para persistencia
- **Usuarios activos** visibles en tiempo real
- **Sincronización automática** de cambios
- **Autenticación** con Firebase Auth

### 🛠️ **Herramientas Avanzadas**
- **Panel FAB** con herramientas de diagrama
- **Exportación** a XMI, JSON y código
- **Auto-organización** de elementos
- **Duplicación** y eliminación masiva

## 🚀 Tecnologías Utilizadas

| Categoría | Tecnología | Versión | Propósito |
|-----------|------------|---------|-----------|
| **Frontend** | React | 18+ | Interfaz de usuario |
| **Build Tool** | Vite | 5+ | Desarrollo y empaquetado |
| **Styling** | Tailwind CSS | 3+ | Estilos y diseño |
| **Diagramas** | React Flow | 11+ | Canvas interactivo |
| **Backend** | Firebase | 9+ | Base de datos y auth |
| **IA** | Google Gemini | 2.5-Flash | Validación inteligente |
| **Alertas** | SweetAlert2 | - | Notificaciones |
| **Archivos** | FileSaver.js | - | Exportación |

## 📋 Prerequisitos

- **Node.js** 18+ 
- **npm** o **yarn**
- **Cuenta Google Cloud** (para Gemini AI)
- **Proyecto Firebase** configurado

## ⚡ Instalación Rápida

### 1. **Clonar el repositorio**
```bash
git clone [URL_DEL_REPOSITORIO]
cd software1-parcial1
```

### 2. **Instalar dependencias**
```bash
npm install
```

### 3. **Configurar variables de entorno**
Crear archivo `.env` en la raíz:
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id

# Gemini AI
VITE_GEMINI_API_KEY=tu_gemini_api_key
```

### 4. **Ejecutar en desarrollo**
```bash
npm run dev
```

### 5. **Compilar para producción**
```bash
npm run build
```

## 🎯 Uso de la Aplicación

### **Crear Diagramas**
1. **Registrarse/Iniciar sesión** en la aplicación
2. **Crear nuevo board** o acceder a uno existente
3. **Agregar clases** usando el sidebar izquierdo
4. **Conectar clases** arrastrando desde los puertos
5. **Editar propiedades** haciendo clic en los elementos

### **Validar con IA**
1. **Completar el diagrama** con al menos una clase
2. **Hacer clic** en "Verificar Diagrama"
3. **Revisar el reporte** JSON con sugerencias
4. **Aplicar mejoras** según las recomendaciones

### **Herramientas Avanzadas**
1. **Abrir panel FAB** (botón azul esquina inferior derecha)
2. **Seleccionar herramienta** deseada:
   - Eliminar elementos seleccionados
   - Duplicar nodos
   - Auto-organizar diagrama
   - Exportar a diferentes formatos
   - Limpiar canvas completo

## 📁 Estructura del Proyecto

```
src/
├── components/           # Componentes reutilizables
│   ├── BurbujaHerramientasDiagrama.jsx
│   ├── CustomModal.jsx
│   ├── ThemeToggle.jsx
│   └── ...
├── config/              # Configuraciones
│   ├── aiConfig.js      # Configuración Gemini AI
│   ├── flowConfig.js    # Configuración React Flow
│   └── useFirebaseFlow.js
├── firebase-confing/    # Configuración Firebase
├── pages/              # Páginas principales
│   ├── BoardPage.jsx   # Editor de diagramas
│   ├── HomePage.jsx    # Página de inicio
│   └── ...
├── utils/              # Utilidades
│   ├── aiUMLValidator.js    # Validador IA
│   ├── codeGenerator.js     # Generador código
│   └── ...
└── routes/             # Rutas de la aplicación
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo
npm run build        # Compilar para producción
npm run preview      # Preview de la build
npm run lint         # Linting del código
```

## 🤝 Contribuir

1. **Fork** el proyecto
2. **Crear branch** para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** al branch (`git push origin feature/AmazingFeature`)
5. **Abrir Pull Request**

## 📝 Changelog

Ver archivo `Cambios realizados.md` para el historial detallado de modificaciones.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👨‍💻 Autor

**[Tu Nombre]**
- GitHub: [@tu-usuario](https://github.com/tu-usuario)
- Email: tu-email@ejemplo.com

## 🙏 Agradecimientos

- **Google Gemini AI** - Por la validación inteligente
- **React Flow** - Por el canvas interactivo
- **Firebase** - Por la infraestructura backend
- **Tailwind CSS** - Por el sistema de diseño

---

⭐ **¡Si te gusta este proyecto, dale una estrella!** ⭐