import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import ThemeToggle from "../ThemeToggle";
import useTheme from "../../hooks/useTheme";

const NavBar = () => {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      {/* Navbar principal con nueva paleta tecnológica */}
      <nav style={{background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))'}} className="shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            {/* Brand / Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <span className="text-2xl font-bold tracking-wide" style={{color: 'var(--color-neutral-light)'}}>
                  Diagramador UML
                </span>
              </Link>
            </div>

            {/* Menú de escritorio */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/"
                className="nav-link-modern"
              >
                Inicio
              </Link>
              {user && (
                <Link
                  to="/board"
                  className="nav-link-modern"
                >
                  Mis Diagramas
                </Link>
              )}
              
              {/* Toggle de tema */}
              <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
              
              {user ? (
                <button
                  onClick={handleLogout}
                  className="btn-danger-modern"
                >
                  Cerrar Sesión
                </button>
              ) : (
                <Link
                  to="/login"
                  className="btn-login-modern"
                >
                  Iniciar Sesión
                </Link>
              )}
            </div>

            {/* Botón móvil (hamburguesa) */}
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md hover:bg-white/10" 
                style={{color: 'var(--color-neutral-light)'}}
              >
                {/* Icono hamburguesa */}
                <svg
                  className={`h-6 w-6 ${isMenuOpen ? "hidden" : "block"}`}
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                {/* Icono cerrar (X) */}
                <svg
                  className={`h-6 w-6 ${isMenuOpen ? "block" : "hidden"}`}
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Menú móvil */}
        <div className={`md:hidden ${isMenuOpen ? "block" : "hidden"}`} style={{background: 'rgba(var(--color-primary-rgb), 0.9)'}}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="block nav-link-modern"
              onClick={() => setIsMenuOpen(false)}
            >
              Inicio
            </Link>
            {user && (
              <Link
                to="/board"
                className="block nav-link-modern"
                onClick={() => setIsMenuOpen(false)}
              >
                Mis Diagramas
              </Link>
            )}
            {user ? (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left block btn-danger-modern"
              >
                Cerrar Sesión
              </button>
            ) : (
              <Link
                to="/login"
                className="block btn-login-modern"
                onClick={() => setIsMenuOpen(false)}
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default NavBar;
