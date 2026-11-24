// pages/Participations/ParticipationsForm.tsx
import { useCallback, useRef, useState } from "react";
import FormGeneric, { type FieldConfig } from "../../components/forms/FormGeneric";
import IneScannerModal from "../../components/forms/IneScannerModal";
import { type IneScanData } from "../../utils/ineParser";
import * as Yup from "yup";
import useParticipationsData from "../../hooks/useParticipationsData";
import { Input, Select2 } from "../../components/forms";
import { formatDatetime, validateCURP } from "../../utils/helpers";
import type { Participation } from "../../domains/models/participation.model";
import useAuthData from "../../hooks/useAuthData";
import sAlert from "../../utils/sAlert";
import useUsersData from "./../../hooks/useUsersData";
import { User } from "../../domains/models/user.model";
import useEventsData from "../../hooks/useEventsData";
import { AxiosRequest } from "../../utils/Axios";
import { icons } from "../../constant";

const ParticipationsForm: React.FC = () => {
   const userAuth = useAuthData().persist.auth;
   const participationsContext = useParticipationsData();
   const usersContext = useUsersData();
   const eventsContext = useEventsData();
   const formikRef = useRef<any>(null);
   const curpInputRef = useRef<HTMLInputElement>(null); // ← REF para el input CURP
   const [ocrLoading, setOcrLoading] = useState(false);
   const [scannerOpen, setScannerOpen] = useState(false);
   const [captureMethod, setCaptureMethod] = useState<"manual" | "google_vision" | "local_ocr">("manual");

   // Limpia touched/error de los campos escaneados. Debe repetirse después de que
   // la alerta toma el foco, porque el blur del campo puede revalidar con el valor previo.
   const markScannedFieldsValid = useCallback(() => {
      const formik = formikRef.current;
      if (!formik) return;
      ["elector_key", "curp"].forEach((field) => {
         formik.setFieldTouched(field, false, false);
         formik.setFieldError(field, undefined);
      });
   }, []);

   const fillScannedData = useCallback(
      (electorKey?: string | null, curp?: string | null) => {
         const formik = formikRef.current;
         if (!formik) return;
         if (electorKey) formik.setFieldValue("elector_key", electorKey, false);
         if (curp) formik.setFieldValue("curp", curp, false);
         markScannedFieldsValid();
      },
      [markScannedFieldsValid]
   );

   const handleDetected = useCallback(
      async (data: IneScanData) => {
         setScannerOpen(false);
         fillScannedData(data.electorKey, data.curp);
         setCaptureMethod("local_ocr");
         await sAlert.Customizable("Credencial leída", "Confirme la Clave de Elector y la CURP antes de registrar.", "success", true);
         markScannedFieldsValid();
      },
      [fillScannedData, markScannedFieldsValid]
   );

   const closeScanner = useCallback(() => setScannerOpen(false), []);

   const handleOcr = async (file?: File) => {
      if (!file) return;
      setOcrLoading(true);
      try {
         const response: any = await AxiosRequest("participations/ocr-ine", "POST", { image: file }, true);
         const result = response?.result ?? response?.data?.result ?? response;
         if (result?.elector_key) formikRef.current?.setFieldValue("elector_key", result.elector_key);
         if (result?.curp) formikRef.current?.setFieldValue("curp", result.curp);
         if (result?.elector_key || result?.curp) {
            setCaptureMethod("google_vision");
            await sAlert.Customizable("Lectura terminada", "Confirme la Clave de Elector y la CURP antes de registrar.", "success", true);
         }
      } finally {
         setOcrLoading(false);
      }
   };

   const handleTipoSelect = (tipo: "INE" | "Carta Identidad") => {
      // console.log("🚀 ~ handleTipoSelect ~ tipo:", tipo);
      formikRef.current.setFieldValue("type", tipo);
      formikRef.current.setFieldValue("elector_key", "");
      formikRef.current.setFieldValue("curp", null);
      setCaptureMethod("manual");

      participationsContext.setFieldValue("type", tipo);
      participationsContext.setFieldValue("elector_key", "");
      participationsContext.setFieldValue("curp", null);
      // participationsContext.setFieldTouched("curp", false);

      // Enfocar el input CURP después de que se renderice
      setTimeout(() => {
         if (curpInputRef.current) {
            curpInputRef.current.focus();
         }
      }, 100); // Pequeño retraso para asegurar que el DOM se actualice
   };

   const formData: FieldConfig<Participation>[] = [
      {
         name: "id",
         value: null,
         input: <Input key="id" col={1} idName="id" label="ID" required hidden />,
         validations: null,
         validationPage: [],
         dividerBefore: { show: false, title: "", orientation: "horizontal", className: "" }
      },
      {
         name: "event_id",
         value: 0,
         input: (
            <Select2
               key="event_id"
               col={12}
               idName="event_id"
               label="Evento"
               options={eventsContext.items.filter((event) => event.active).map((event) => ({ id: event.id, label: event.name }))}
               required
            />
         ),
         validations: Yup.number().min(1, "Seleccione el evento").required("El evento es obligatorio"),
         validationPage: [],
         dividerBefore: { show: true, title: "Evento activo", orientation: "horizontal", className: "" }
      },
      {
         name: "type",
         value: "",
         // input: <Select2 key="type" col={12} idName="type" label="Tipo de Documento" options={tipoOptions} required />,
         input: (
            <div className="doc-selector" style={{ paddingTop: 2 }}>
               <div className={`doc-option ${participationsContext.initialValues.type === "INE" ? "selected" : ""}`} onClick={() => handleTipoSelect("INE")}>
                  <div className="doc-check">✓</div>
                  <span className="doc-icon-wrap">🪪</span>
                  <div className="doc-label">INE</div>
                  <div className="doc-desc">Credencial para votar</div>
               </div>
               <div
                  className={`doc-option ${participationsContext.initialValues.type === "Carta Identidad" ? "selected" : ""}`}
                  onClick={() => handleTipoSelect("Carta Identidad")}
               >
                  <div className="doc-check">✓</div>
                  <span className="doc-icon-wrap">📄</span>
                  <div className="doc-label">Carta Identidad</div>
                  <div className="doc-desc">Documento Oficial</div>
               </div>
               {!participationsContext.initialValues.type && (
                  <div className="empty-state grid col-span-2" style={{ padding: "0px 0" }}>
                     <div className="empty-icon animate-bounce" style={{ fontSize: 32 }}>
                        ☝️
                     </div>
                     <div className="empty-title">Seleccione el tipo de documento que presentaste</div>
                     <div className="empty-desc">Elija INE o Carta Identidad para continuar</div>
                  </div>
               )}
            </div>
         ),
         validations: Yup.string().required("Selecciona un tipo de documento"),
         validationPage: [],
         dividerBefore: { show: false, title: "", orientation: "horizontal", className: "" }
      },
      {
         name: "elector_key",
         value: "",
         input: (
            <div className={!participationsContext.initialValues.type ? "hidden" : ""} style={{ animation: "slideIn 0.3s ease" }}>
               <Input
                  key="curp"
                  col={12}
                  idName="elector_key"
                  label="Clave de Elector"
                  placeholder="6 letras + 6 números + 6 caracteres"
                  type="text"
                  textStyleCase={null}
                  helperText="Capture los 18 caracteres impresos en la credencial, como indica el manual operativo."
                  required
                  inputRef={curpInputRef} // ← Pasar la ref al componente Input
               />
            </div>
         ),
         validations: Yup.string()
            .trim()
            .uppercase()
            .matches(/^[A-Z]{6}\d{6}[A-Z0-9]{6}$/, "La Clave de Elector debe contener 18 caracteres")
            .required("La Clave de Elector es obligatoria"),
         validationPage: [],
         dividerBefore: { show: false, title: "", orientation: "horizontal", className: "" }
      },
      {
         name: "curp",
         value: null,
         input: (
            <div className={!participationsContext.initialValues.type ? "hidden" : ""}>
               <Input
                  col={12}
                  idName="curp"
                  label="CURP (opcional)"
                  sizeCols={{ md: 12, xs: 12, sm: 12 }}
                  placeholder="Puede capturarla manualmente o mediante OCR"
                  helperText="Dato complementario; revise siempre el resultado del OCR."
               />
            </div>
         ),
         validations: Yup.string()
            .nullable()
            .test("curp-valid", "Formato de CURP inválido", (value) => !value || validateCURP(value)),
         validationPage: [],
         dividerBefore: { show: false, title: "", orientation: "horizontal", className: "" }
      },
      {
         name: "ocr_capture" as keyof Participation,
         value: null,
         input: (
            <div className={`ocr-capture ${participationsContext.initialValues.type !== "INE" ? "hidden" : ""}`}>
               <div className="ocr-capture__icon">
                  <icons.Lu.LuScanLine />
               </div>
               <div className="ocr-capture__copy">
                  <strong>Escanear credencial INE</strong>
                  <span>Lee la Clave de Elector en el teléfono abriendo la cámara para capturar la información.</span>
               </div>
               <div className="ocr-capture__actions">
                  <button type="button" className="ocr-capture__action" onClick={() => setScannerOpen(true)}>
                     Escanear con cámara
                  </button>
                  {/* OPCIÓN DE RESPALDO
                  <label className={`ocr-capture__action ocr-capture__action--ghost ${ocrLoading ? "is-loading" : ""}`}>
                     {ocrLoading ? "Procesando…" : "Google Vision (respaldo)"}
                     <input type="file" accept="image/*" capture="environment" disabled={ocrLoading} onChange={(event) => handleOcr(event.target.files?.[0])} />
                  </label> */}
               </div>
            </div>
         ),
         validations: null,
         validationPage: [],
         dividerBefore: { show: false, title: "", orientation: "horizontal", className: "" }
      }
   ];

   const validations = {};

   const validationSchema = () => Yup.object().shape(validations);

   const onSubmit = async (values: any) => {
      // El user_id se añadirá en beforePost del hook
      const { ocr_capture: _ocrCapture, ...registrationValues } = values;
      const res = await participationsContext.request({
         method: "POST",
         url: `${participationsContext.prefix}/register-voter`,
         data: { ...registrationValues, capture_method: captureMethod },
         getData: true
      });
      // console.log("🚀 ~ onSubmit ~ res:", res);
      const electorErrors = (res as any)?.error?.elector_key;
      const isDuplicate = Array.isArray(electorErrors) && electorErrors.some((message: string) => /ya fue registrado/i.test(message));
      if (isDuplicate) {
         const participation: Participation = participationsContext.items.find((p) => p.elector_key === values.elector_key) ?? ({} as Participation);
         const casilla: User = usersContext.items.find((u) => u.id === participation.user_id) ?? ({} as User);
         return sAlert.Customizable(
            "Participación Duplicada",
            `
               <div style="text-align: left; font-family: 'Nunito Sans', sans-serif;">
               <p>La Clave de Elector <strong style="color: #9B2242;">${participation.elector_key?.toUpperCase().trim()}</strong>
                  ya fue registrada en la <strong>${casilla.full_name}</strong> 
                  el <strong>${formatDatetime(participation.created_at)}</strong>.</p>
                  <p style="margin-top: 8px;">✅ Su participación ya está contabilizada.</p>
               </div>
               `,
            "warning",
            true
         );
      }
      const issued = res?.result ?? res?.data?.result ?? res;
      if (issued?.folio && issued?.otp) {
         await sAlert.Customizable(
            "Registro completado",
            `<div style="text-align:center"><p>Folio</p><strong style="font-size:1.3rem">${issued.folio}</strong><p style="margin-top:12px">Código para abrir la boleta</p><strong style="font-size:2rem;letter-spacing:.25rem;color:#9B2242">${issued.otp}</strong><p style="margin-top:12px">Entréguelo únicamente al ciudadano.</p></div>`,
            "success",
            true
         );
      }
      formikRef.current.resetForm();
      setCaptureMethod("manual");
      participationsContext.handleChangeItem({
         id: 0,
         event_id: 0,
         type: null,
         elector_key: "",
         curp: null,
         user_id: userAuth?.id ?? 0
      });

      // Limpiar formulario después de enviar (opcional)
      // if (formikRef.current) {
      //    formikRef.current.resetForm();
      // }
   };

   const handleCancel = () => {
      if (formikRef.current) {
         formikRef.current.resetForm();
      }
      participationsContext.handleChangeItem({
         id: 0,
         event_id: 0,
         type: null,
         elector_key: "",
         curp: null,
         user_id: userAuth?.id || 0
      });
   };

   return (
      <>
         <div className="card mb-6" style={{ animation: "slideIn 0.3s ease" }}>
            <div className="card-header">
               <span className="card-title-text">
                  1. Tipo de Documento
                  {/* {participationsContext.initialValues.id > 0 ? "Editar Registro" : "Nuevo Registro de Participación"} */}
               </span>
            </div>
            <div className="card-body">
               <FormGeneric
                  initialValuesContext={participationsContext.initialValues}
                  formData={formData}
                  validations={validations}
                  formikRef={formikRef}
                  validationSchema={validationSchema}
                  onSubmit={onSubmit}
                  textBtnSubmit={participationsContext.textBtnSubmit}
                  handleCancel={handleCancel}
                  container="none"
               />
            </div>
         </div>
         <IneScannerModal open={scannerOpen} onClose={closeScanner} onDetected={handleDetected} />
      </>
   );
};

export default ParticipationsForm;
