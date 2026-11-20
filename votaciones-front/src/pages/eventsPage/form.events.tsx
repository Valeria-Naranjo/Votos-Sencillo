import { useRef } from "react";
import * as Yup from "yup";
import FormGeneric, { type FieldConfig } from "../../components/forms/FormGeneric";
import { FormHeader, Input, Select2 } from "../../components/forms";
import type { Options } from "../../components/forms/Select2";
import type { VotingEvent } from "../../domains/models/event.model";
import useEventsData from "../../hooks/useEventsData";
import { icons } from "../../constant";

const eventTypes: Options = [
   { id: "attendance", label: "Sólo registro de participación / asistencia" },
   { id: "attendance_ballot", label: "Registro de participación y votación con boleta" }
];

const EventsForm = () => {
   const events = useEventsData();
   const formikRef = useRef<any>(null);
   const validations: Record<string, Yup.AnySchema> = {};
   const fields: FieldConfig<VotingEvent>[] = [
      { name: "id", value: 0, input: <Input col={1} idName="id" label="ID" hidden />, validations: null, validationPage: [], dividerBefore: { show: false, title: "", orientation: "horizontal", className: "" } },
      { name: "name", value: "", input: <Input col={7} idName="name" label="Nombre del evento" placeholder="Ej. Presupuesto Participativo 2027" required />, validations: Yup.string().trim().required("El nombre es obligatorio"), validationPage: [], dividerBefore: { show: true, title: "Identidad del evento", orientation: "horizontal", className: "" } },
      { name: "logo_path", value: null, input: <Input col={5} idName="logo_path" label="Logo" placeholder="Ruta o URL institucional" helperText="Puede dejarlo vacío y configurarlo después." />, validations: Yup.string().nullable(), validationPage: [], dividerBefore: { show: false, title: "", orientation: "horizontal", className: "" } },
      { name: "event_type", value: "attendance", input: <Select2 col={8} idName="event_type" label="Modalidad" options={eventTypes} required />, validations: Yup.string().oneOf(["attendance", "attendance_ballot"]).required(), validationPage: [], dividerBefore: { show: true, title: "Operación", orientation: "horizontal", className: "" } },
      { name: "max_votes", value: 5, input: <Input col={4} idName="max_votes" label="Máximo de proyectos" type="number" min={1} max={5} helperText="Sólo aplica cuando el evento incluye boleta." required />, validations: Yup.number().min(1).max(5).required(), validationPage: [], dividerBefore: { show: false, title: "", orientation: "horizontal", className: "" } },
      { name: "starts_at", value: null, input: <Input col={6} idName="starts_at" label="Inicio" type="text" placeholder="AAAA-MM-DD HH:mm" />, validations: Yup.string().nullable(), validationPage: [], dividerBefore: { show: false, title: "", orientation: "horizontal", className: "" } },
      { name: "ends_at", value: null, input: <Input col={6} idName="ends_at" label="Cierre" type="text" placeholder="AAAA-MM-DD HH:mm" />, validations: Yup.string().nullable(), validationPage: [], dividerBefore: { show: false, title: "", orientation: "horizontal", className: "" } }
   ];

   if (!events.open) return null;
   return <section className="card mb-6">
      <FormHeader icon={icons.Lu.LuCalendarCog} title={events.initialValues.id ? "Editar evento" : "Nuevo evento"} subtitle="Configura la modalidad que gobernará participaciones, proyectos y boletas." />
      <div className="card-body"><FormGeneric initialValuesContext={events.initialValues} formData={fields} validations={validations} formikRef={formikRef} validationSchema={() => Yup.object().shape(validations)} onSubmit={async (values) => { await events.postItem(values as VotingEvent); formikRef.current?.resetForm(); }} textBtnSubmit={events.textBtnSubmit} handleCancel={() => events.setOpen()} /></div>
   </section>;
};

export default EventsForm;
