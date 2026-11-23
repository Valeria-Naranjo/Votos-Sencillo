import CustomTable, { renderColActive } from "../../components/CustomTable";
import CustomButton from "../../components/CustomButtom";
import Tooltip from "../../components/Tooltip";
import { icons } from "../../constant";
import useEventsData from "../../hooks/useEventsData";

const EventsTable = () => {
   const events = useEventsData();
   const edit = (row: any) => {
      // setOpen primero: restablece initialValues y luego se cargan los del evento elegido
      events.setOpen();
      events.handleChangeItem(row);
   };
   const remove = (row: any) => {
      events.removeItemData(row);
   };
   //FECHA EN ZONA HORARIA DEL CENTRO DE MÉXICO
   const formatEventDate = (value: string | null | undefined) => {
      if (!value) return "--";

      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return "--";

      return new Intl.DateTimeFormat("es-MX", {
         dateStyle: "short",
         timeStyle: "short",
         timeZone: "America/Monterrey"
      }).format(date);
   };
   return (
      <CustomTable
         data={events.items}
         minTableHeight="80vh"
         loading={events.loading}
         onRefresh={events.fetchData}
         singularName="Evento"
         headerActions={() => <></>}
         columns={[
            { field: "name", headerName: "Evento" },
            {
               field: "event_type",
               headerName: "Modalidad",
               renderField: (value) => (value === "attendance_ballot" ? "Participación + boleta" : "Sólo participación")
            },
            { field: "max_votes", headerName: "Máx. votos" },
            { field: "starts_at", headerName: "Inicio", renderField: (value) => <>{formatEventDate(String(value))}</> },
            { field: "ends_at", headerName: "Cierre", renderField: (value) => <>{formatEventDate(String(value))}</> },
            { field: "active", headerName: "Estado", renderField: (value) => renderColActive(Boolean(value)) }
         ]}
         actions={(row) => (
            <div className="grid grid-flow-col gap-1">
               <Tooltip title="Editar evento">
                  <CustomButton color="blue" size="sm" onClick={() => edit(row)}>
                     <icons.Lu.LuPencil />
                  </CustomButton>
               </Tooltip>
               <Tooltip title="Eliminar evento">
                  <CustomButton color="rose" size="sm" onClick={() => remove(row)}>
                     <icons.Lu.LuTrash2 />
                  </CustomButton>
               </Tooltip>
            </div>
         )}
         getRowActions={(row) => [
            { label: "Editar", iconName: "pi-pen-to-square", handleOnClick: () => edit(row), color: "blue", permission: true },
            { label: "Eliminar", iconName: "pi-trash", handleOnClick: () => remove(row), color: "red", permission: true }
         ]}
      />
   );
};

export default EventsTable;
