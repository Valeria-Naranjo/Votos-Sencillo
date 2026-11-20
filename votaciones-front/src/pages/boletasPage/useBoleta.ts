import { useCallback, useReducer, useRef } from "react";
import Swal from "sweetalert2";
import type { Project } from "../../domains/models/project.model";
import { BoletaStep, type BoletaState } from "./boleta.types";
import { MAX_VOTOS } from "./boleta.const";
import useBallotsData from "../../hooks/useBallotsData";
import useAuthData from "../../hooks/useAuthData";

// ─── Action types ─────────────────────────────────────────────────────────
type Action =
   | { type: "SET_FIELD"; field: keyof BoletaState; value: BoletaState[keyof BoletaState] }
   | { type: "GO_STEP"; next: BoletaStep }
   | { type: "ADD_VOTE"; project: Project }
   | { type: "REMOVE_VOTE"; id: number }
   | { type: "RESET" };

// ─── Initial state ────────────────────────────────────────────────────────
const INITIAL_STATE: BoletaState = {
   step: BoletaStep.Identidad,
   prevStep: BoletaStep.Identidad,
   voterCasilla: "",
   voterNVotos: 5,
   seleccion: [],
   search: "",
   dropdownOpen: false,
   districtFilter: null,
   shakeSlot: null,
   folio: "",
   submitted: false,
   loading: false,
   accessFolio: "",
   accessOtp: "",
   ballotToken: "",
   participationId: null,
   eventId: null
};

// ─── Reducer ──────────────────────────────────────────────────────────────
function reducer(state: BoletaState, action: Action): BoletaState {
   switch (action.type) {
      case "SET_FIELD":
         return { ...state, [action.field]: action.value };
      case "GO_STEP":
         return { ...state, prevStep: state.step, step: action.next };
      case "ADD_VOTE":
         return { ...state, seleccion: [...state.seleccion, action.project], search: "", dropdownOpen: false };
      case "REMOVE_VOTE":
         return { ...state, seleccion: state.seleccion.filter((s) => s.id !== action.id) };
      case "RESET":
         return INITIAL_STATE;
      default:
         return state;
   }
}

// ─── Hook principal ──────────────────────────────────────────────────────
export function useBoleta() {
   const userAuth = useAuthData().persist.auth;
   INITIAL_STATE.voterCasilla = userAuth?.full_name ?? "";
   INITIAL_STATE.districtFilter = userAuth?.casilla_district ?? null;

   const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
   const dropRef = useRef<HTMLDivElement>(null);
   const shakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

   const ballotsContext = useBallotsData();

   // ── Navegación ──────────────────────────────────────────────────────────
   const goStep = useCallback((next: BoletaStep) => {
      dispatch({ type: "GO_STEP", next });
      window.scrollTo({ top: 0, behavior: "smooth" });
   }, []);

   // ── Campo genérico ──────────────────────────────────────────────────────
   const setField = useCallback(<K extends keyof BoletaState>(field: K, value: BoletaState[K]) => {
      dispatch({ type: "SET_FIELD", field, value });
   }, []);

   // ── Helpers de onChange para StepIdentidad ──────────────────────────────
   const handleIdentidadChange = useCallback((field: "voterCasilla" | "voterNVotos" | "accessFolio" | "accessOtp", value: string | number) => {
      if (field === "voterNVotos") {
         const clamped = Math.min(MAX_VOTOS, Math.max(1, Number(value) || 1));
         dispatch({ type: "SET_FIELD", field, value: clamped });
      } else {
         dispatch({ type: "SET_FIELD", field, value: value as string });
      }
   }, []);

   // ── Validar paso 0 (identidad) ──────────────────────────────────────────
   const handleStep0 = useCallback(async () => {
      const { voterCasilla, accessFolio, accessOtp } = state;
      if (!voterCasilla.trim()) {
         Swal.fire({
            icon: "warning",
            title: "Casilla no seleccionada",
            text: "Por favor selecciona la casilla de votación.",
            confirmButtonColor: "#9B2242"
         });
         return;
      }
      if (!accessFolio.trim() || accessOtp.length !== 6) {
         Swal.fire({ icon: "warning", title: "Folio incompleto", text: "Capture el folio y los seis dígitos entregados en Registro.", confirmButtonColor: "#9B2242" });
         return;
      }
      dispatch({ type: "SET_FIELD", field: "loading", value: true });
      const opened: any = await ballotsContext.request({ method: "POST", url: "ballots/open", data: { folio: accessFolio, otp: accessOtp }, getData: false });
      dispatch({ type: "SET_FIELD", field: "loading", value: false });
      if (!opened?.ballot_token) return;
      dispatch({ type: "SET_FIELD", field: "ballotToken", value: opened.ballot_token });
      dispatch({ type: "SET_FIELD", field: "participationId", value: opened.participation?.id ?? null });
      dispatch({ type: "SET_FIELD", field: "eventId", value: opened.event?.id ?? null });
      dispatch({ type: "SET_FIELD", field: "voterNVotos", value: opened.event?.max_votes ?? 5 });
      goStep(BoletaStep.Seleccion);
   }, [state, goStep, ballotsContext]);

   // ── Validar paso 1 (selección completa) ─────────────────────────────────
   const handleStep1 = useCallback(() => {
      const { seleccion, voterNVotos } = state;
      if (seleccion.length < voterNVotos) {
         Swal.fire({
            icon: "info",
            title: "Selección incompleta",
            html: `<p>Llevas <b>${seleccion.length}</b> seleccionado${seleccion.length !== 1 ? "s" : ""} de <b>${voterNVotos} proyecto${voterNVotos > 1 ? "s" : ""}</b>.</p>`,
            showCancelButton: true,
            cancelButtonText: "Continuar seleccionando",
            confirmButtonColor: "#9B2242",
            confirmButtonText: "Registrar",
            reverseButtons: true
         }).then((result) => {
            if (result.isConfirmed) {
               goStep(BoletaStep.Revision);
            }
         });
         return;
      }
      goStep(BoletaStep.Revision);
   }, [state, goStep]);

   // ── Agregar un proyecto a la selección ──────────────────────────────────
   const addVote = useCallback(
      (project: Project) => {
         const { seleccion, voterNVotos } = state;
         if (seleccion.some((s) => s.id === project.id)) return;

         if (seleccion.length >= voterNVotos) {
            const slotIdx = voterNVotos - 1;
            dispatch({ type: "SET_FIELD", field: "shakeSlot", value: slotIdx });
            if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
            shakeTimerRef.current = setTimeout(() => dispatch({ type: "SET_FIELD", field: "shakeSlot", value: null }), 500);

            Swal.fire({
               toast: true,
               position: "top-end",
               showConfirmButton: false,
               timer: 2200,
               icon: "warning",
               title: `Ya seleccionaste ${voterNVotos} proyecto${voterNVotos > 1 ? "s" : ""}`,
               timerProgressBar: true
            });
            return;
         }
         dispatch({ type: "ADD_VOTE", project });
      },
      [state]
   );

   // ── Quitar un proyecto de la selección ──────────────────────────────────
   const removeVote = useCallback((id: number) => {
      dispatch({ type: "REMOVE_VOTE", id });
   }, []);

   // ── Enviar boleta al backend (usando useBallotsData) ────────────────────
   const handleSubmit = useCallback(async () => {
      const { voterCasilla, seleccion, voterNVotos } = state;
      const user = userAuth;
      if (!user || !user.id) {
         Swal.fire({
            icon: "error",
            title: "No autenticado",
            text: "No se pudo identificar al usuario. Por favor inicia sesión nuevamente.",
            confirmButtonColor: "#9B2242"
         });
         return;
      }

      if (!state.participationId || !state.ballotToken) {
         Swal.fire({ icon: "error", title: "Boleta no habilitada", text: "Vuelva a capturar su folio.", confirmButtonColor: "#9B2242" });
         return;
      }

      dispatch({ type: "SET_FIELD", field: "loading", value: true });
      try {
         const result: any = await ballotsContext.request({ method: "POST", url: "ballots/submit", data: { participation_id: state.participationId, ballot_token: state.ballotToken, votes: seleccion.map((project) => project.id) }, getData: false });
         if (!result?.id) throw new Error("No se confirmó la boleta");
         dispatch({ type: "SET_FIELD", field: "folio", value: state.accessFolio });
         dispatch({ type: "SET_FIELD", field: "submitted", value: true });
         goStep(BoletaStep.Exito);
      } catch (error) {
         console.error(error);
         Swal.fire({
            icon: "error",
            title: "Error al registrar",
            text: "Ocurrió un problema al enviar tu boleta. Inténtalo de nuevo.",
            confirmButtonColor: "#9B2242"
         });
      } finally {
         dispatch({ type: "SET_FIELD", field: "loading", value: false });
      }
   }, [state, ballotsContext, goStep]);

   // ── Reiniciar todo (después de votar) ───────────────────────────────────
   const resetBoleta = useCallback(() => {
      dispatch({ type: "RESET" });
   }, []);

   // ── Clase para animación de slide (dependiendo de dirección) ────────────
   const slideClass = state.step >= state.prevStep ? "slide-in-right" : "slide-in-left";

   // ── Porcentaje de avance (para barra) ───────────────────────────────────
   const pct = state.voterNVotos > 0 ? (state.seleccion.length / state.voterNVotos) * 100 : 0;

   return {
      state,
      dropRef,
      slideClass,
      pct,
      setField,
      handleIdentidadChange,
      handleStep0,
      handleStep1,
      handleSubmit,
      resetBoleta,
      addVote,
      removeVote,
      goStep
   };
}
