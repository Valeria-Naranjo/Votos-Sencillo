import { icons } from "../../constant";
import type { AccessControlData } from "../../hooks/useAccessControlData";

export default function RoleForm({ access }: { access: AccessControlData }) {
   return (
      <aside className="role-rail">
         <div className="rail-heading"><span>Roles</span><span>{access.roles.length}</span></div>
         <button className="new-role-button" onClick={access.beginCreateRole}><icons.Lu.LuPlus /> Nuevo rol</button>
         {(access.creatingRole || access.editingRole) && (
            <div className="new-role-form">
               <label>Nombre<input autoFocus value={access.roleDraft.role} onChange={(event) => access.setRoleDraft({ ...access.roleDraft, role: event.target.value })} placeholder="Ej. Supervisor" /></label>
               <label>Descripción<textarea value={access.roleDraft.description} onChange={(event) => access.setRoleDraft({ ...access.roleDraft, description: event.target.value })} placeholder="Responsabilidad principal" /></label>
               <div><button onClick={access.closeRoleForm}>Cancelar</button><button className="primary" onClick={access.submitRole}>{access.editingRole ? "Guardar" : "Crear"}</button></div>
            </div>
         )}
         {access.displayedRoles.map((role) => (
            <button key={role.id} className={role.id === access.roleId ? "role-row active" : "role-row"} onClick={() => access.selectRole(role.id)}>
               <span className="role-avatar">{role.role.slice(0, 2).toUpperCase()}</span>
               <span><strong>{role.role}</strong><small>{role.users_count} usuario{role.users_count === 1 ? "" : "s"}</small></span>
            </button>
         ))}
      </aside>
   );
}

