import CustomTable, { renderColActive } from "../../components/CustomTable";
import CustomButton from "../../components/CustomButtom";
import Tooltip from "../../components/Tooltip";
import { icons } from "../../constant";
import useEventsData from "../../hooks/useEventsData";

const EventsTable = () => {
   const events = useEventsData();
   const edit = (row: any) => {
      events.handleChangeItem(row);
      events.setOpen();
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
            <Tooltip title="Editar evento">
               <CustomButton color="blue" size="sm" onClick={() => edit(row)}>
                  <icons.Lu.LuPencil />
               </CustomButton>
            </Tooltip>
         )}
         getRowActions={(row) => [{ label: "Editar", iconName: "pi-pen-to-square", handleOnClick: () => edit(row), color: "blue", permission: true }]}
      />
   );
};

export default EventsTable;
