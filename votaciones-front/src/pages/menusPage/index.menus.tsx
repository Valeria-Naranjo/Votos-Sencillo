import { icons } from "../../constant";
import useMenusData from "../../hooks/useMenusData";
import MenuForm from "./form.menus";
import MenuTable from "./table.menus";
import "./menus.css";

export default function MenuManagementPage() {
   const menus = useMenusData();
   return (
      <div className="menus-page">
         <header className="menus-header"><div><h1>Administración de menús</h1><p>Define módulos, pantallas y permisos especiales sin perder la relación con los roles.</p></div><button className="menu-primary" onClick={menus.beginCreate}><icons.Lu.LuPlus /> Nuevo menú</button></header>
         <div className="menus-workspace"><MenuForm menus={menus} /><MenuTable menus={menus} /></div>
      </div>
   );
}
