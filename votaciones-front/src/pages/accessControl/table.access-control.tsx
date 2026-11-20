import Select from "react-select";
import { icons } from "../../constant";
import { emptyPermission } from "../../domains/models/access-control.model";
import type { AccessControlData } from "../../hooks/useAccessControlData";

const actions = [["can_view", "Ver"], ["can_create", "Crear"], ["can_update", "Editar"], ["can_delete", "Eliminar"]] as const;
const permissionLabel = (value: string) => value === "manage_permissions" ? "Administrar permisos" : value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export function PermissionTable({ access }: { access: AccessControlData }) {
   return (
      <section className="permission-panel">
         <div className="permission-toolbar">
            <div><h2>{access.currentRole?.role ?? "Selecciona un rol"}</h2><p>{access.currentRole?.description || "Configura el alcance operativo de este rol."}</p>{access.currentRole && !access.currentRole.active && <span className="inactive-role-label">Rol desactivado</span>}</div>
            <div className="permission-summary"><strong>{access.enabledCount}</strong><span>de {access.itemMenus.length} pantallas</span></div>
            <div className="role-toolbar-actions">
               <button className="icon-action" onClick={access.beginEditRole} disabled={!access.currentRole || access.roleId === 1} aria-label="Editar rol"><icons.Lu.LuPencil /></button>
               <button className="icon-action danger" onClick={access.toggleRoleStatus} disabled={!access.currentRole || access.roleId === 1} aria-label={access.currentRole?.active ? "Desactivar rol" : "Reactivar rol"}>{access.currentRole?.active ? <icons.Lu.LuPower /> : <icons.Lu.LuRefreshCw />}</button>
               <button className="access-save" disabled={!access.dirty || access.saving || access.roleId === 1 || !access.currentRole?.active} onClick={access.savePermissions}>{access.saving ? "Guardando…" : access.dirty ? "Guardar cambios" : "Sin cambios"}</button>
            </div>
         </div>
         <div className="access-search"><icons.Lu.LuSearch /><input value={access.query} onChange={(event) => access.setQuery(event.target.value)} placeholder="Buscar módulo o pantalla" /></div>
         {access.roleId === 1 && <div className="access-notice"><icons.Lu.LuLockKeyhole /> SuperAdmin conserva acceso total y no puede limitarse.</div>}
         {access.permissionError && <div className="access-notice error"><icons.Lu.LuCircleAlert /> No fue posible cargar los permisos. <button onClick={access.retryPermissions}>Reintentar</button></div>}
         <div className="permission-groups">
            {access.filteredGroups.map((group) => {
               const ids = group.children?.map((menu) => menu.id) ?? [];
               const all = ids.length > 0 && ids.every((id) => access.permissions[id]?.can_view);
               return (
                  <section className="permission-group" key={group.id}>
                     <div className="group-title"><div><h3>{group.menu}</h3><span>{group.children?.length} pantallas</span></div><button onClick={() => access.toggleGroup(group, !all)} disabled={access.roleId === 1}>{all ? "Quitar todo" : "Conceder todo"}</button></div>
                     <div className="permission-list">{group.children?.map((menu) => {
                        const permission = access.permissions[menu.id] ?? emptyPermission(menu.id);
                        const custom = (menu.others_permissions ?? "").split(",").map((value) => value.trim()).filter(Boolean);
                        return (
                           <article className={permission.can_view ? "permission-row enabled" : "permission-row"} key={menu.id}>
                              <label className="screen-toggle"><input type="checkbox" checked={permission.can_view} onChange={() => access.togglePermission(menu.id, "can_view")} disabled={access.roleId === 1} /><span><strong>{menu.menu}</strong><small>{menu.url}</small></span></label>
                              <div className="action-checks">{actions.slice(0, menu.read_only ? 1 : 4).map(([field, label]) => <label key={field}><input type="checkbox" checked={permission[field]} onChange={() => access.togglePermission(menu.id, field)} disabled={access.roleId === 1} />{label}</label>)}
                                 {custom.map((name) => <label className="custom" key={name}><input type="checkbox" checked={permission.custom_permissions.includes(name)} onChange={() => access.togglePermission(menu.id, "custom_permissions", name)} disabled={access.roleId === 1} />{permissionLabel(name)}</label>)}
                              </div>
                           </article>
                        );
                     })}</div>
                  </section>
               );
            })}
         </div>
      </section>
   );
}

export function UserRoleTable({ access }: { access: AccessControlData }) {
   const activeRoleOptions = access.roles.filter((role) => role.active).map((role) => ({ value: role.id, label: role.role }));
   return (
      <section className="user-access-panel" id="users-panel" role="tabpanel" aria-labelledby="users-tab">
         <div className="user-access-heading"><div><h2>Asignación rápida de roles</h2><p>Cambiar un rol cerrará todas las sesiones del usuario.</p></div><div className="access-search"><icons.Lu.LuSearch /><input value={access.query} onChange={(event) => access.setQuery(event.target.value)} placeholder="Buscar usuario o correo" /></div></div>
         <div className="user-role-list">{access.users.filter((user) => `${user.username} ${user.email}`.toLowerCase().includes(access.query.toLowerCase())).map((user) => (
            <div className="user-role-row" key={user.id}>
               <span className="role-avatar">{user.username.slice(0, 2).toUpperCase()}</span>
               <span className="user-copy"><strong>{user.username}</strong><small>{user.email}</small></span>
               <span className={user.active ? "status active" : "status"}>{user.active ? "Activo" : "Inactivo"}</span>
               <Select inputId={`user-role-${user.id}`} className="access-role-select" classNamePrefix="access-role-select" aria-label={`Rol de ${user.username}`} isDisabled={access.pendingUserId === user.id} options={activeRoleOptions} value={activeRoleOptions.find((role) => role.value === user.role_id) ?? null} onChange={(option) => option && access.assignRole(user, option.value)} menuPortalTarget={document.body} styles={{ menuPortal: (base) => ({ ...base, zIndex: 1000 }) }} />
            </div>
         ))}</div>
      </section>
   );
}

