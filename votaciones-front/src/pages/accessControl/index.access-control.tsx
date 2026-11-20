import { icons } from "../../constant";
import useAccessControlData from "../../hooks/useAccessControlData";
import RoleForm from "./form.access-control";
import { PermissionTable, UserRoleTable } from "./table.access-control";
import "./access-control.css";

export default function AccessControlPage() {
   const access = useAccessControlData();
   return (
      <div className="access-page">
         <header className="access-header">
            <div><h1>Accesos y permisos</h1><p>Controla lo que cada rol puede ver y hacer. Los cambios cierran las sesiones afectadas automáticamente.</p></div>
            <div className="access-tabs" role="tablist" aria-label="Secciones de control de acceso">
               <button id="roles-tab" role="tab" aria-selected={access.tab === "roles"} aria-controls="roles-panel" className={access.tab === "roles" ? "active" : ""} onClick={() => access.setTab("roles")}><icons.Lu.LuShieldCheck /> Roles</button>
               <button id="users-tab" role="tab" aria-selected={access.tab === "users"} aria-controls="users-panel" className={access.tab === "users" ? "active" : ""} onClick={() => access.setTab("users")}><icons.Lu.LuUsers /> Usuarios</button>
            </div>
         </header>
         {access.tab === "roles" ? <div className="access-workspace" id="roles-panel" role="tabpanel" aria-labelledby="roles-tab"><RoleForm access={access} /><PermissionTable access={access} /></div> : <UserRoleTable access={access} />}
      </div>
   );
}
