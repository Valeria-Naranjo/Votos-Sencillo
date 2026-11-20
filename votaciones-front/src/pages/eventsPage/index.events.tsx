import useEventsData from "../../hooks/useEventsData";
import EventsForm from "./form.events";
import EventsTable from "./table.events";

const EventsPage = () => {
   const events = useEventsData();
   return <div className="page">
      <div className="page-header"><div><div className="breadcrumb">Configuración <span>›</span> <span>Eventos</span></div><h1 className="page-title">Eventos de votación</h1><p className="page-subtitle">Cada evento concentra su modalidad, participaciones, proyectos y boletas.</p></div><button className="btn-secondary" onClick={() => events.setOpen()}>{events.open ? "✕ Cancelar" : "+ Nuevo evento"}</button></div>
      <EventsForm />
      <EventsTable />
   </div>;
};

export default EventsPage;
