import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Select from "react-select";
import * as Yup from "yup";
import { icons } from "../../constant";
import { menuFormDefaults, type MenuFormValues } from "../../domains/models/menu.model";
import type { MenusData } from "../../hooks/useMenusData";

const schema: Yup.ObjectSchema<MenuFormValues> = Yup.object({
   menu: Yup.string().trim().max(100).required("Escribe el nombre visible."),
   code: Yup.string().trim().nullable().defined().when("type", { is: "item", then: (value) => value.matches(/^[a-z][a-z0-9_]*$/, "Usa minúsculas, números y guion bajo.").required("El código es obligatorio.") }),
   caption: Yup.string().trim().max(255).nullable().defined(),
   type: Yup.mixed<"group" | "item">().oneOf(["group", "item"]).required(),
   belongs_to: Yup.number().integer().min(0).required(),
   url: Yup.string().trim().nullable().defined().when("type", { is: "item", then: (value) => value.matches(/^\//, "La ruta debe iniciar con /.").required("La ruta es obligatoria.") }),
   icon: Yup.string().trim().max(100).nullable().defined(),
   order: Yup.number().integer().min(0).max(999).required("Indica el orden."),
   show_counter: Yup.boolean().required(),
   counter_name: Yup.string().trim().max(100).nullable().defined(),
   others_permissions: Yup.string().trim().max(1000).nullable().defined(),
   read_only: Yup.boolean().required()
});

export default function MenuForm({ menus }: { menus: MenusData }) {
   const { register, control, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<MenuFormValues>({ resolver: yupResolver(schema), defaultValues: menuFormDefaults });
   const type = watch("type");
   const groupOptions = menus.groups.map((menu) => ({ value: menu.id, label: menu.menu }));

   const clear = () => { menus.beginCreate(); reset(menuFormDefaults); };
   useEffect(() => {
      if (!menus.editing) { reset(menuFormDefaults); return; }
      const menu = menus.editing;
      reset({ menu: menu.menu, code: menu.code ?? "", caption: menu.caption ?? "", type: menu.type, belongs_to: menu.belongs_to, url: menu.url ?? "", icon: menu.icon ?? "", order: menu.order ?? 0, show_counter: menu.show_counter, counter_name: menu.counter_name ?? "", others_permissions: menu.others_permissions ?? "", read_only: menu.read_only });
      document.querySelector(".menu-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
   }, [menus.editing, menus.formResetKey, reset]);

   const submit = async (values: MenuFormValues) => { await menus.saveMenu(values); reset(menuFormDefaults); };

   return (
      <aside className="menu-editor" aria-label={menus.editing ? "Editar menú" : "Crear menú"}>
         <div className="menu-editor-heading"><div><h2>{menus.editing ? "Editar menú" : "Nuevo menú"}</h2><p>{menus.editing ? `ID ${menus.editing.id}` : "Completa los datos obligatorios."}</p></div>{menus.editing && <button onClick={clear} aria-label="Cerrar edición"><icons.Lu.LuX /></button>}</div>
         <form onSubmit={handleSubmit(submit)} noValidate>
            <div className="menu-type-switch" role="radiogroup" aria-label="Tipo de menú"><label><input type="radio" value="group" {...register("type")} /> Módulo</label><label><input type="radio" value="item" {...register("type")} /> Pantalla</label></div>
            <Field label="Nombre" error={errors.menu?.message} required><input type="text" {...register("menu")} aria-invalid={!!errors.menu} placeholder="Ej. Usuarios" /></Field>
            {type === "group" ? <Field label="Descripción" error={errors.caption?.message}><textarea rows={3} {...register("caption")} placeholder="Qué contiene este módulo" /></Field> : <>
               <Field label="Módulo padre" error={errors.belongs_to?.message} required><Controller name="belongs_to" control={control} render={({ field }) => <Select inputId="menu-parent" aria-invalid={!!errors.belongs_to} classNamePrefix="menu-select" options={groupOptions} value={groupOptions.find((option) => option.value === field.value) ?? null} onChange={(option) => field.onChange(option?.value ?? 0)} placeholder="Selecciona un módulo" noOptionsMessage={() => "No hay módulos"} menuPortalTarget={document.body} styles={{ menuPortal: (base) => ({ ...base, zIndex: 1000 }) }} />} /></Field>
               <div className="menu-form-grid"><Field label="Código" error={errors.code?.message} required><input type="text" {...register("code")} aria-invalid={!!errors.code} placeholder="users" /></Field><Field label="Orden" error={errors.order?.message} required><input type="number" inputMode="numeric" {...register("order")} aria-invalid={!!errors.order} /></Field></div>
               <Field label="Ruta" error={errors.url?.message} required><input type="text" {...register("url")} aria-invalid={!!errors.url} placeholder="/usuarios" /></Field>
               <div className="menu-form-grid"><Field label="Icono"><input type="text" {...register("icon")} placeholder="LuUsers" /></Field><Field label="Permisos especiales"><input type="text" {...register("others_permissions")} placeholder="aprobar,rechazar" /></Field></div>
               <label className="menu-check"><input type="checkbox" {...register("read_only")} /><span><strong>Sólo lectura</strong><small>Oculta crear, editar y eliminar en la matriz.</small></span></label>
            </>}
            <div className="menu-editor-actions"><button type="button" onClick={clear}>Limpiar</button><button className="menu-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? "Guardando…" : menus.editing ? "Guardar cambios" : "Crear menú"}</button></div>
         </form>
      </aside>
   );
}

function Field({ label, error, required, children }: { label: string; error?: string; required?: boolean; children: React.ReactNode }) {
   return <label className="menu-field"><span>{label}{required && <b aria-hidden="true"> *</b>}</span>{children}{error ? <small className="menu-error"><icons.Lu.LuCircleAlert /> {error}</small> : <small aria-hidden="true">&nbsp;</small>}</label>;
}

