import { type FormikValues, useFormikContext } from "formik";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Select from "react-tailwindcss-select";
import Toast from "../../utils/Toast";
import icons from "./../../constant/icons"; // Asegúrate de que tenga TbReload y RiAddCircleLine

// =================== INTERFACES =======================
interface Option {
   id?: number | string;
   value?: any;
   label: any;
}
interface GroupOption {
   id?: number | string;
   label: string;
   options: Option[];
   value?: any;
}
export type Options = (Option | GroupOption)[];

interface Select2Props {
   xsOffset?: number | null;
   col?: number;
   sizeCols?: { xs: number; sm: number; md: number };
   idName: string;
   label: string;
   options?: Options;
   helperText?: string;
   hidden?: boolean;
   namePropLabel?: string;
   disabled?: boolean;
   color?: string;
   mb?: number;
   size?: "sm" | "md" | "lg";
   className?: React.HTMLAttributes<HTMLDivElement> | string;
   onChangeExtra?: (value: any) => void;
   focus?: boolean;
   multiple?: boolean;
   refreshSelect?: () => Promise<void> | null;
   addRegister?: () => Promise<void> | null;
   required?: boolean;
   pluralName?: string;
   singularName?: string;
}

type dataPreviewType = {
   cont: number;
   dataPreview: Array<Record<string, any>>;
   ignore: boolean;
};

/**
 * Select2 - Select personalizado con integración Formik, opciones de recarga y agregar registro.
 */
const Select2: React.FC<Select2Props> = ({
   xsOffset = null,
   col = 12,
   sizeCols = { xs: 12, sm: 12, md: col },
   idName,
   label,
   options = [],
   helperText,
   hidden = false,
   namePropLabel,
   disabled,
   color = "primary",
   mb = 2,
   size = "md",
   className = "",
   onChangeExtra,
   focus = false,
   multiple = false,
   refreshSelect,
   addRegister,
   pluralName = "lista",
   singularName = "registro",
   required = false
}) => {
   const [value, setValue] = useState<Option | null>(null);
   const formik = useFormikContext<FormikValues>();
   const inputRef = useRef<HTMLInputElement>(null);
   const [dataPreview, setDataPreview] = useState<dataPreviewType>({
      cont: 0,
      dataPreview: [],
      ignore: false
   });
   const [loading, setLoading] = useState(false);

   const error =
      formik.touched[idName === "colony" ? "community_id" : idName] && formik.errors[idName === "colony" ? "community_id" : idName]
         ? String(formik.errors[idName === "colony" ? "community_id" : idName])
         : null;
   const isError = Boolean(error);

   // Mapeo de tamaño de DaisyUI
   const sizeClass =
      {
         sm: "input-sm",
         md: "input-md",
         lg: "input-lg"
      }[size] || "input-md";

   // Clases para columnas responsivas
   const fieldStyle = { "--field-span": sizeCols.md, "--field-offset": xsOffset ?? 0 } as React.CSSProperties;

   const handleChange = (selected: any) => {
      setValue(selected);
      formik.setFieldValue(idName, selected === null ? null : selected.id);
      if (onChangeExtra) onChangeExtra({ idName, value: selected });
   };

   const handleClickRefresh = async (onlyRefresh = true) => {
      try {
         setLoading(true);
         if (refreshSelect) await refreshSelect();
         setLoading(false);
         if (onlyRefresh) {
            setDataPreview((prev) => ({ ...prev, ignore: true }));
         } else {
            setDataPreview((prev) => ({ ...prev, cont: 0, ignore: false }));
         }
         Toast.Success("Lista Actualizada");
      } catch (error: any) {
         console.log(error);
         Toast.Error(error);
      }
   };

   const handleClickAddRegister = async () => {
      try {
         setLoading(true);
         if (addRegister) {
            await addRegister();
            await handleClickRefresh(false);
         }
         setLoading(false);
         Toast.Success("Registro agregado");
      } catch (error: any) {
         console.log(error);
         Toast.Error(error);
      }
   };

   useEffect(() => {
      setTimeout(() => {
         if (focus && inputRef.current) {
            inputRef.current.focus();
         }
      }, 500);
   }, [focus]);

   useEffect(() => {
      if (dataPreview.cont === 0 && options.length > 0) {
         setDataPreview({
            cont: 1,
            dataPreview: options,
            ignore: false
         });
      }
      if (options.length > 0 && dataPreview.dataPreview.length > 0 && options.length > dataPreview.dataPreview.length && !dataPreview.ignore) {
         const dataReorder = [...options].sort((a, b) => (b.id || 0) - (a.id || 0));
         const newValue = dataReorder[0];
         formik.setFieldValue(idName, newValue.id);
         if (onChangeExtra) onChangeExtra({ idName, value: newValue });
      }
   }, [options]);

   useEffect(() => {
      setValue(null);
      if (formik.values[idName] > 0) {
         setValue(options.find((item) => item.id === formik.values[idName]) || null);
      }
   }, [idName, formik.values[idName]]);

   useLayoutEffect(() => {
      // Puedes ordenar opciones aquí si es necesario
   }, []);

   return (
      <div className={`canonical-field ${hidden ? "hidden" : ""} ${className}`} style={fieldStyle}>
         <div className="canonical-select-row flex items-start gap-2">
            <label className="form-control grow min-w-0 w-full relative mb-2">
               <div className="canonical-field-label">
                  <span className={`canonical-field-label-text ${isError ? "text-error" : ""}`}>{label}</span>
                  <span className={`canonical-field-status ${isError ? "text-error" : ""}`}>{required ? "Requerido" : "Opcional"}</span>
               </div>

               <Select
                  key={`key-Select`}
                  isSearchable
                  value={value as any}
                  options={options as any}
                  onChange={handleChange}
                  placeholder="Selecciona una opción..."
                  searchInputPlaceholder="buscar..."
                  noOptionsMessage="No se encontraron opciones"
                  loading={loading}
                  isDisabled={loading || disabled}
                  isMultiple={multiple}
                  isClearable={true}
                  classNames={{
                     menuButton: ({ isDisabled }) =>
                        `canonical-select input ${sizeClass} ${isError ? "input-error" : ""} items-center flex text-sm text-gray-700 transition-all duration-200 focus:outline-none bg-base-100`,
                     searchIcon: "absolute w-4 h-4 mt-2 ml-1 text-gray-500",
                     searchBox:
                        "canonical-select-search input input-sm w-full py-2 pl-8 pr-3 text-sm focus:ring-0 focus:outline-none text-base-content",
                     searchContainer: "canonical-select-search-wrap relative px-2 pt-2",
                     menu: "canonical-select-menu bg-white py-1 transition-all duration-200 shadow-lg",
                     list: "canonical-select-list list-select2 mt-1 max-h-60 overflow-y-auto px-1 pb-1",
                     listItem: ({ isSelected }) =>
                        `canonical-select-option block transition duration-150 px-3 py-2.5 cursor-pointer select-none truncate rounded-lg text-gray-700 hover:bg-guinda-off hover:text-guinda-primary ${isSelected ? "selected bg-guinda-off text-guinda-primary" : ""}`
                  }}
                  primaryColor={""}
               />

               <div className="canonical-field-help">
                  <span className={`label-text-alt ${!isError && !helperText ? "text-transparent" : ""} ${isError ? "text-error" : ""}`}>
                     {isError ? error : helperText || ""}
                  </span>
               </div>
            </label>

            {/* Botón de actualizar lista */}
            {refreshSelect && (
               <div className="tooltip tooltip-top" data-tip={`Actualizar ${pluralName}`}>
                  <button
                     type="button"
                     className="canonical-select-action btn btn-sm btn-circle mt-7 disabled:opacity-50"
                     onClick={() => handleClickRefresh(true)}
                     disabled={disabled || loading}
                  >
                     <icons.Lu.LuIterationCw size={18} />
                  </button>
               </div>
            )}

            {/* Botón de agregar registro */}
            {addRegister && (
               <div className="tooltip tooltip-right" data-tip={`Agregar ${singularName}`}>
                  <button
                     type="button"
                     className="canonical-select-action canonical-select-action-success btn btn-sm btn-circle mt-7 disabled:opacity-50"
                     onClick={handleClickAddRegister}
                     disabled={disabled || loading}
                  >
                     <icons.Lu.LuCirclePlus size={20} />
                  </button>
               </div>
            )}
         </div>
      </div>
   );
};

export default Select2;
