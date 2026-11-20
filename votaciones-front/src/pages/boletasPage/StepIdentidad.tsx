import React from "react";
import { icons } from "../../constant";
import type { StepIdentidadProps } from "./boleta.types";

const StepIdentidad: React.FC<StepIdentidadProps> = ({ voterCasilla, voterNVotos, accessFolio, accessOtp, loading, casillas, userAuth, onChange, onContinue }) => (
   <div className="voter-id-card slide-in-right">
      <div className="voter-badge">
         <icons.Lu.LuIdCard size={14} />
         &nbsp;Verificación de casilla
      </div>

      <div
         style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "var(--guinda-dark)",
            marginBottom: 4
         }}
      >
         Ingresa el folio entregado en Registro
      </div>

      <p style={{ fontSize: ".85rem", color: "var(--gris)", marginBottom: 22, lineHeight: 1.6 }}>El código habilita una sola boleta y vence automáticamente.</p>

      <div className="grid gap-4 md:grid-cols-2" style={{ marginBottom: 20 }}>
         <div className="config-field"><label>Folio de participación</label><input className="config-input" value={accessFolio} placeholder="EV-1-XXXXXXXXXX" onChange={(e) => onChange("accessFolio", e.target.value.toUpperCase())} /></div>
         <div className="config-field"><label>Código de 6 dígitos</label><input className="config-input ballot-otp-input" value={accessOtp} inputMode="numeric" maxLength={6} placeholder="000000" onChange={(e) => onChange("accessOtp", e.target.value.replace(/\D/g, "").slice(0, 6))} /></div>
      </div>

      <div className="grid gap-4.5 grid-cols-4" style={{ marginBottom: 20 }}>
         {/* Casilla */}
         <div className="config-field col-span-3">
            <label>Casilla de Votación</label>
            {userAuth?.role_id === 1 ? (
               <select className="config-select" value={voterCasilla} onChange={(e) => onChange("voterCasilla", e.target.value)}>
                  {/* {userAuth?.casilla_place && <option value={userAuth.casilla_place}>{userAuth.casilla_place}</option>} */}
                  {casillas
                     .filter((c) => !userAuth?.casilla_place || c.place !== userAuth.casilla_place)
                     .map((c) => (
                        <option key={c.id} value={c.place}>
                           ({c.type}) {c.place} {c.location ? `→ ${c.location}` : ""}
                        </option>
                     ))}
               </select>
            ) : (
               <p className="config-input">{voterCasilla}</p>
            )}
         </div>

         {/* Número de votos */}
         <div className="config-field">
            <label>Número de Votos (N)</label>
            {userAuth?.role_id === 1 ? (
               <input className="config-input" type="number" min={1} max={5} value={voterNVotos} disabled onChange={(e) => onChange("voterNVotos", e.target.value)} />
            ) : (
               <p className="config-input">{voterNVotos}</p>
            )}
         </div>
      </div>

      <div
         style={{
            background: "rgba(155,34,66,.04)",
            border: "1px solid rgba(155,34,66,.12)",
            borderRadius: 12,
            padding: "14px 18px",
            marginBottom: 22,
            display: "flex",
            gap: 12,
            alignItems: "flex-start"
         }}
      >
         <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>🔒</span>
         <div style={{ fontSize: ".8rem", color: "var(--gris-cool)", lineHeight: 1.5 }}>
            <b style={{ color: "var(--guinda-dark)" }}>Tu voto es secreto.</b> Los proyectos que elijas no se asocian a tu nombre en los resultados públicos. Solo se
            registra que participaste.
         </div>
      </div>

      <button className="btn-primary" onClick={onContinue} type="button" disabled={loading}>
         <icons.Lu.LuArrowBigRight size={17} color="#fff" />
         {loading ? "Validando…" : "Abrir boleta"}
      </button>
   </div>
);

export default StepIdentidad;
