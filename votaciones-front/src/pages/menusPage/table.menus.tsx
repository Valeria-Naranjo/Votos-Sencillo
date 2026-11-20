import CustomButton from "../../components/CustomButtom";
import CustomTable, { renderColActive } from "../../components/CustomTable";
import Tooltip from "../../components/Tooltip";
import { icons } from "../../constant";
import type { MenuItem } from "../../domains/models/menu.model";
import type { MenusData } from "../../hooks/useMenusData";

export default function MenuTable({ menus }: { menus: MenusData }) {
   const editMenu = (menu: MenuItem) => menus.setEditing(menu);
   const changeStatus = (menu: MenuItem) => menus.toggleStatus(menu);

   return (
      <section className="menu-list-panel menu-custom-table">
         <CustomTable<MenuItem>
            data={menus.menus}
            title="Menús configurados"
            subtitle="Busca, ordena y administra módulos y pantallas."
            loading={menus.loading}
            error={menus.loadError ? "No fue posible cargar los menús. Usa refrescar para intentarlo nuevamente." : undefined}
            columns={[
               {
                  headerName: "Menú",
                  field: "menu",
                  minWidth: 190,
                  groupable: true,
                  renderField: (value, row) => (
                     <div className="menu-cell-copy">
                        <strong>{String(value)}</strong>
                        <small>{row.caption || (row.type === "group" ? "Módulo de navegación" : "Pantalla operativa")}</small>
                     </div>
                  )
               },
               {
                  headerName: "Jerarquía",
                  field: "belongs_to",
                  minWidth: 150,
                  renderField: (_value, row) => (
                     <div className="menu-cell-copy">
                        <span className="menu-kind">{row.type === "group" ? "Módulo" : row.patern || "Sin módulo"}</span>
                        <small>Orden {row.order ?? 0}</small>
                     </div>
                  )
               },
               {
                  headerName: "Ruta y código",
                  field: "url",
                  minWidth: 210,
                  renderField: (value, row) => (
                     <div className="menu-cell-copy">
                        <code>{row.code || "—"}</code>
                        <small>{String(value || "Sin ruta")}</small>
                     </div>
                  )
               },
               {
                  headerName: "Estado",
                  field: "active",
                  minWidth: 120,
                  filterType: "boolean",
                  renderField: (value) => renderColActive(Boolean(value))
               }
            ]}
            enableRowSelection={false}
            onRowSelect={() => {}}
            actions={(row) => (
               <div className="grid grid-flow-col gap-1">
                  <Tooltip title="Editar menú">
                     <CustomButton color="blue" size="sm" onClick={() => editMenu(row)}>
                        <icons.Lu.LuPencil />
                     </CustomButton>
                  </Tooltip>
                  <Tooltip title={row.active ? "Desactivar menú" : "Reactivar menú"}>
                     <CustomButton color="rose" size="sm" onClick={() => changeStatus(row)} disabled={menus.savingId === row.id}>
                        {row.active ? <icons.Lu.LuPower /> : <icons.Lu.LuRefreshCw />}
                     </CustomButton>
                  </Tooltip>
               </div>
            )}
            getRowActions={(row) => [
               { label: "Editar", iconName: "pi-pen-to-square", handleOnClick: () => editMenu(row), color: "blue", permission: true },
               { label: row.active ? "Desactivar" : "Reactivar", iconName: row.active ? "pi-power-off" : "pi-refresh", handleOnClick: () => changeStatus(row), color: "red", permission: true }
            ]}
            rowNameField="menu"
            singularName="Menú"
            onRefresh={menus.loadMenus}
            headerActions={() => <></>}
            defaultView="table"
         />
      </section>
   );
}
