import { useEffect, useMemo, useState } from "react";
import type { MenuFormValues, MenuItem } from "../domains/models/menu.model";
import { AxiosRequest, GetAxios } from "../utils/Axios";
import Toast from "../utils/Toast";

export default function useMenusData() {
   const [menus, setMenus] = useState<MenuItem[]>([]);
   const [editing, setEditing] = useState<MenuItem | null>(null);
   const [query, setQuery] = useState("");
   const [loading, setLoading] = useState(true);
   const [loadError, setLoadError] = useState(false);
   const [savingId, setSavingId] = useState<number | "new" | null>(null);
   const [formResetKey, setFormResetKey] = useState(0);

   const loadMenus = async () => {
      setLoading(true);
      setLoadError(false);
      try {
         const response = await GetAxios("/menus");
         const result = response.result ?? response.data?.result ?? [];
         setMenus(result.map((menu: MenuItem) => ({
            ...menu,
            active: Boolean(menu.active),
            read_only: Boolean(menu.read_only),
            show_counter: Boolean(menu.show_counter)
         })));
      } catch {
         setLoadError(true);
         Toast.Error("No fue posible cargar los menús.");
      } finally { setLoading(false); }
   };

   useEffect(() => { void loadMenus(); }, []);

   const groups = menus.filter((menu) => menu.type === "group");
   const filteredMenus = useMemo(() => menus.filter((menu) => `${menu.menu} ${menu.code ?? ""} ${menu.url ?? ""} ${menu.patern ?? ""}`.toLowerCase().includes(query.toLowerCase())), [menus, query]);

   const saveMenu = async (values: MenuFormValues) => {
      setSavingId(editing?.id ?? "new");
      try {
         await AxiosRequest(editing ? `/menus/${editing.id}` : "/menus", editing ? "PUT" : "POST", values);
         Toast.Success(editing ? "Menú actualizado; se cerraron las sesiones afectadas." : "Menú creado.");
         setEditing(null);
         await loadMenus();
      } finally { setSavingId(null); }
   };

   const toggleStatus = async (menu: MenuItem) => {
      if (!confirm(`¿${menu.active ? "Desactivar" : "Reactivar"} ${menu.menu}?${menu.active ? " Los accesos vinculados se actualizarán al volver a iniciar sesión." : ""}`)) return;
      setSavingId(menu.id);
      try {
         await AxiosRequest(`/menus/${menu.id}/status`, "PATCH", { active: !menu.active });
         await loadMenus();
         Toast.Success(menu.active ? "Menú desactivado." : "Menú reactivado.");
      } finally { setSavingId(null); }
   };

   return { menus, groups, filteredMenus, editing, setEditing, formResetKey, beginCreate, query, setQuery, loading, loadError, savingId, loadMenus, saveMenu, toggleStatus };
}

export type MenusData = ReturnType<typeof useMenusData>;
   const beginCreate = () => {
      setEditing(null);
      setFormResetKey((key) => key + 1);
   };

