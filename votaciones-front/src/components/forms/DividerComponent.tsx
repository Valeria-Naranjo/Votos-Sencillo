import React from "react";

interface DividerComponentProps {
   title: string;
   orientation?: "horizontal" | "vertical";
   className?: React.HTMLAttributes<HTMLDivElement>;
}

/**
 * DividerComponent - Componente de separador con texto usando DaisyUI.
 * @param title - Texto que aparece en el centro del separador (solo en horizontal).
 * @param orientation - "horizontal" (por defecto) o "vertical".
 * @param className - Clases CSS adicionales.
 */
const DividerComponent: React.FC<DividerComponentProps> = ({ title, orientation = "horizontal", className = "" }) => {
   if (orientation === "horizontal") {
      return (
         <div className={`canonical-form-divider ${className}`} role="separator">
            <span>{title}</span>
         </div>
      );
   }

   // Para vertical, DaisyUI no soporta texto, así que mostramos solo la línea vertical
   return <div className={`canonical-form-divider-vertical ${className}`} role="separator" />;
};

export default DividerComponent;
