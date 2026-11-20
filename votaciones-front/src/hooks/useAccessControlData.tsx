import { useEffect, useMemo, useRef, useState } from "react";
import type { AccessMenu, AccessPermission, AccessRole, AccessUser, RoleDraft } from "../domains/models/access-control.model";
import { emptyPermission } from "../domains/models/access-control.model";
import { AxiosRequest, GetAxios } from "../utils/Axios";
import Toast from "../utils/Toast";

const initialRole: RoleDraft = { role: "", description: "", page_index: "/estadisticas" };

export default function useAccessControlData() {
   const [roles, setRoles] = useState<AccessRole[]>([]);
   const [menus, setMenus] = useState<AccessMenu[]>([]);
   const [users, setUsers] = useState<AccessUser[]>([]);
   const [roleId, setRoleId] = useState(0);
   const [permissions, setPermissions] = useState<Record<number, AccessPermission>>({});
   const [query, setQuery] = useState("");
   const [tab, setTab] = useState<"roles" | "users">("roles");
   const [saving, setSaving] = useState(false);
   const [dirty, setDirty] = useState(false);
   const [creatingRole, setCreatingRole] = useState(false);
   const [editingRole, setEditingRole] = useState(false);
   const [roleDraft, setRoleDraft] = useState<RoleDraft>(initialRole);
   const [pendingUserId, setPendingUserId] = useState<number | null>(null);
   const [permissionError, setPermissionError] = useState(false);
   const permissionRequest = useRef(0);

   const currentRole = roles.find((role) => role.id === roleId);
   const displayedRoles = roleId ? [...roles].sort((left, right) => Number(right.id === roleId) - Number(left.id === roleId)) : roles;
   const itemMenus = useMemo(() => menus.flatMap((group) => group.children ?? []), [menus]);
   const enabledCount = Object.values(permissions).filter((permission) => permission.can_view).length;
   const filteredGroups = useMemo(() => menus
      .map((group) => ({ ...group, children: group.children?.filter((menu) => `${group.menu} ${menu.menu}`.toLowerCase().includes(query.toLowerCase())) }))
      .filter((group) => group.children?.length), [menus, query]);

   const loadCatalog = async (preferredRole?: number) => {
      const response = await GetAxios("/roles/access/catalog");
      const data = response.result;
      setRoles(data.roles);
      setMenus(data.menus);
      setUsers(data.users);
      setRoleId(preferredRole ?? (roleId || data.roles.find((role: AccessRole) => role.id !== 1)?.id || data.roles[0]?.id));
   };

   useEffect(() => { void loadCatalog(); }, []);
   useEffect(() => {
      if (!roleId) return;
      const requestId = ++permissionRequest.current;
      setPermissionError(false);
      GetAxios(`/roles/${roleId}/access`).then((response) => {
         if (requestId !== permissionRequest.current) return;
         const next: Record<number, AccessPermission> = {};
         itemMenus.forEach((menu) => { next[menu.id] = emptyPermission(menu.id); });
         response.result.permissions.forEach((permission: AccessPermission) => {
            next[permission.menu_id] = { ...permission, custom_permissions: permission.custom_permissions ?? [] };
         });
         setPermissions(next);
         setDirty(false);
      }).catch(() => {
         if (requestId === permissionRequest.current) setPermissionError(true);
      });
   }, [roleId, itemMenus.length]);

   const selectRole = (nextRoleId: number) => {
      if (dirty && !confirm("Hay cambios sin guardar. ¿Cambiar de rol?")) return;
      setRoleId(nextRoleId);
   };

   const togglePermission = (menuId: number, field: keyof AccessPermission, custom?: string) => {
      setPermissions((current) => {
         const permission = current[menuId] ?? emptyPermission(menuId);
         let updated: AccessPermission;
         if (field === "custom_permissions" && custom) {
            const enabled = permission.custom_permissions.includes(custom);
            updated = { ...permission, custom_permissions: enabled ? permission.custom_permissions.filter((value) => value !== custom) : [...permission.custom_permissions, custom] };
         } else {
            const value = !permission[field];
            updated = { ...permission, [field]: value } as AccessPermission;
            if (field === "can_view" && !value) updated = emptyPermission(menuId);
            if (field !== "can_view" && value) updated.can_view = true;
         }
         return { ...current, [menuId]: updated };
      });
      setDirty(true);
   };

   const toggleGroup = (group: AccessMenu, value: boolean) => {
      setPermissions((current) => {
         const next = { ...current };
         group.children?.forEach((menu) => {
            next[menu.id] = value ? {
               menu_id: menu.id,
               can_view: true,
               can_create: !menu.read_only,
               can_update: !menu.read_only,
               can_delete: !menu.read_only,
               custom_permissions: (menu.others_permissions ?? "").split(",").map((permission) => permission.trim()).filter(Boolean)
            } : emptyPermission(menu.id);
         });
         return next;
      });
      setDirty(true);
   };

   const savePermissions = async () => {
      if (!currentRole || currentRole.id === 1) return;
      setSaving(true);
      try {
         await AxiosRequest(`/roles/${roleId}/access`, "PUT", { permissions: Object.values(permissions) });
         Toast.Success("Permisos guardados. Se cerraron las sesiones afectadas.");
         setDirty(false);
      } finally { setSaving(false); }
   };

   const assignRole = async (user: AccessUser, nextRoleId: number) => {
      const nextRole = roles.find((role) => role.id === nextRoleId);
      if (!confirm(`¿Asignar el rol ${nextRole?.role ?? "seleccionado"} a ${user.username}? Sus sesiones activas se cerrarán.`)) return;
      setPendingUserId(user.id);
      try {
         await AxiosRequest(`/roles/users/${user.id}/role`, "PUT", { role_id: nextRoleId });
         Toast.Success(`Rol de ${user.username} actualizado; sus sesiones fueron cerradas.`);
         await loadCatalog(roleId);
      } catch { Toast.Error("No fue posible actualizar el rol. Intenta nuevamente."); }
      finally { setPendingUserId(null); }
   };

   const beginCreateRole = () => {
      setEditingRole(false);
      setCreatingRole((open) => !open);
      setRoleDraft(initialRole);
   };

   const beginEditRole = () => {
      if (!currentRole || currentRole.id === 1) return;
      setRoleDraft({ role: currentRole.role, description: currentRole.description ?? "", page_index: currentRole.page_index ?? "/estadisticas" });
      setCreatingRole(false);
      setEditingRole(true);
   };

   const closeRoleForm = () => { setCreatingRole(false); setEditingRole(false); setRoleDraft(initialRole); };

   const submitRole = async () => {
      const name = roleDraft.role.trim();
      if (!name) return Toast.Warning("Escribe el nombre del rol.");
      if (editingRole && currentRole) {
         await AxiosRequest(`/roles/${currentRole.id}`, "PUT", { ...roleDraft, role: name });
         closeRoleForm();
         await loadCatalog(currentRole.id);
         Toast.Success("Rol actualizado. Las sesiones vinculadas fueron cerradas.");
         return;
      }
      await AxiosRequest("/roles", "POST", { ...roleDraft, role: name });
      closeRoleForm();
      await loadCatalog();
      Toast.Success(`Rol ${name} creado. Ya puedes asignarle permisos.`);
   };

   const toggleRoleStatus = async () => {
      if (!currentRole || currentRole.id === 1) return;
      const nextActive = !currentRole.active;
      if (!confirm(`${nextActive ? "¿Reactivar" : "¿Desactivar"} el rol ${currentRole.role}? ${nextActive ? "Podrá volver a asignarse." : "Las sesiones de sus usuarios se cerrarán."}`)) return;
      await AxiosRequest(`/roles/${currentRole.id}/status`, "PATCH", { active: nextActive });
      await loadCatalog(currentRole.id);
      Toast.Success(nextActive ? "Rol reactivado." : "Rol desactivado y sesiones cerradas.");
   };

   const retryPermissions = () => {
      const retryRole = currentRole?.id ?? 0;
      setRoleId(0);
      queueMicrotask(() => setRoleId(retryRole));
   };

   return {
      roles, users, roleId, permissions, query, setQuery, tab, setTab, saving, dirty,
      creatingRole, editingRole, roleDraft, setRoleDraft, pendingUserId, permissionError,
      currentRole, displayedRoles, itemMenus, enabledCount, filteredGroups,
      selectRole, togglePermission, toggleGroup, savePermissions, assignRole,
      beginCreateRole, beginEditRole, closeRoleForm, submitRole, toggleRoleStatus, retryPermissions
   };
}

export type AccessControlData = ReturnType<typeof useAccessControlData>;

