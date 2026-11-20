import type { ComponentType, SVGProps } from "react";

interface FormHeaderProps {
   icon: ComponentType<SVGProps<SVGSVGElement>>;
   title: string;
   subtitle?: string;
}

const FormHeader = ({ icon: Icon, title, subtitle }: FormHeaderProps) => (
   <header className="canonical-form-header">
      <span className="canonical-form-header-icon" aria-hidden="true">
         <Icon size={20} />
      </span>
      <span className="canonical-form-header-copy">
         <span className="canonical-form-header-title">{title}</span>
         {subtitle && <span className="canonical-form-header-subtitle">{subtitle}</span>}
      </span>
   </header>
);

export default FormHeader;
