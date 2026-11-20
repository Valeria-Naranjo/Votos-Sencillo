import { motion } from "framer-motion";
import { RegistrationForm } from "../components/RegistrationForm";

export function RegistroPage() {
   return (
      <div className="p-4 md:p-6 lg:p-8">
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ padding: 15 }} className="p-4">
            {/* Title Section */}
            <div className="text-center mb-8 md:mb-12">
               <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="inline-flex items-center gap-2 bg-guinda-primary/10 text-guinda-primary px-4 py-2 rounded-full text-sm font-medium mb-4"
               >
                  <span className="w-2 h-2 bg-guinda-primary rounded-full animate-pulse"></span>
                  Sistema Oficial de Registro
               </motion.div>

               <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-negro mb-4" style={{ fontFamily: "Georgia, serif" }}>
                  Registro de Participacion Ciudadana
               </h1>

               <p className="text-gris text-lg max-w-2xl mx-auto leading-relaxed">
                  Seleccione su metodo de identificacion y complete su registro de manera rapida y segura.
               </p>
            </div>

            {/* Registration Form */}
            <RegistrationForm />

            {/* Footer Info */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.5 }} className="mt-12 text-center text-sm text-gris">
               <p>Sus datos estan protegidos conforme a la Ley Federal de Proteccion de Datos Personales.</p>
               <p className="mt-2">
                  En caso de dudas, comuniquese al Teléfono Atención Ciudadana:{" "}
                  <a href={"tel:+528712533903"} className="text-guinda-primary font-medium">
                     87 12 53 39 03
                  </a>{" "}
                  ó al Teléfono Presidencia:{" "}
                  <a href="tel:+528711751000" className="text-guinda-primary font-medium">
                     87 11 75 10 00
                  </a>
               </p>
            </motion.div>
         </motion.div>
      </div>
   );
}
