import React, { useState, useRef, useEffect } from "react";
import icons from "./../constant/icons";
import Avatar from "./Avatar";
import { useNavigate } from "react-router-dom";
import useAuthData from "../hooks/useAuthData";

const Topbar = () => {
   const authContext = useAuthData();
   // const auth = useAuthStore((state) => state.auth);
   // const setAuth = useAuthStore((state) => state.setAuth);
   const [open, setOpen] = useState(false);
   const navigate = useNavigate();
   const ref = useRef(null);
   const [classChevronUserMenu, setClassChevronUserMenu] = useState("");

   const handleClickLogout = async () => {
      console.log("a cerrar sesión");
      await authContext.logout();
   };

   useEffect(() => {
      const handleClickOutside = (e: { target: any }) => {
         if (ref.current && !ref.current.contains(e.target) ) setOpen(false);
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
   }, []);

   useEffect(() => {
      setClassChevronUserMenu(!open ? "rotate-180 transition-all" : "transition-all");
   }, [open]);

   const initials = authContext.persist.auth?.username
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

   return (
      <nav className="app-topbar navbar w-full bg-guinda-secondary px-3! justify-between header">
         {/* header-left */}
         <div className="header-left">
            <label htmlFor="my-drawer-4" className="btn btn-circle" aria-label="Abrir o cerrar menú lateral">
               <icons.Lu.LuMenu aria-hidden="true" size={28} />
            </label>
               <div className="app-topbar-title">
                  <div className="font-playfair text-white text-sm font-bold leading-tight">Sistema de Votaciones Ciudadana</div>
                  <div className="text-[0.68rem] text-white/60 tracking-wider uppercase">Proceso Participativo 2026</div>
               </div>
         </div>
         {/* header-right */}
         <div className="relative" ref={ref}>
            <button className="user-menu-btn" onClick={() => setOpen((o) => !o)}>
               {/* <div className="w-7 h-7 bg-guinda rounded-full flex items-center justify-center text-xs font-bold">{initials}</div> */}
               <Avatar size="w-8" ring indicator="online">
                  {initials}
               </Avatar>
               <div>
                  <div className="user-name">{authContext.persist.auth?.username}</div>
                  <div className="user-role">{authContext.persist.auth?.role_name}</div>
               </div>
               {/* <span className="text-sm font-medium">{authContext.persist.authnombre.split(" ")[0]}</span> */}
               <icons.Lu.LuChevronDown size={14} className={`${classChevronUserMenu} transition-all`} />
            </button>
            {/* {open && ( */}
            <div className={`dropdown ${!open ? "drop-out" : ""} `}>
               <div style={{ padding: "10px" }}>
                  <div className="font-bold text-negro">{authContext.persist.auth?.username}</div>
                  <div className="text-xs text-gris">{authContext.persist.auth?.email}</div>
               </div>
               <div className="dropdown-divider" />
               <button
                  className="dropdown-item"
                  onClick={() => {
                     setOpen(false);
                     navigate("/perfil");
                  }}
               >
                  <icons.Lu.LuUser size={15} />
                  <span>Ver perfil</span>
               </button>
               <button
                  className="dropdown-item"
                  onClick={() => {
                     setOpen(false);
                     navigate("/registro");
                  }}
               >
                  <icons.Lu.LuClipboardPenLine size={15} />
                  <span>Registrar Participación</span>
               </button>
               <div className="dropdown-divider" />

               <button className="dropdown-item danger" onClick={handleClickLogout}>
                  <icons.Lu.LuLogOut size={15} />
                  <span>Cerrar sesión</span>
               </button>
            </div>
            {/* )} */}
         </div>
      </nav>
   );
};

export default Topbar;
