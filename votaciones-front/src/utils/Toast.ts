import { enqueueSnackbar, type VariantType, type SnackbarOrigin } from "notistack";
// import Swal from "sweetalert2";

// Tipos reutilizables
type Horizontal = SnackbarOrigin["horizontal"];
type Vertical = SnackbarOrigin["vertical"];

// Helper base
const showSnackbar = (msg: string, variant: VariantType, horizontal: Horizontal = "right", vertical: Vertical = "bottom", autoHideDuration = 2500) => {
   enqueueSnackbar(msg, {
      variant,
      autoHideDuration,
      anchorOrigin: { horizontal, vertical }
   });
};

// Métodos específicos
const Success = (msg: string, horizontal: Horizontal = "right", vertical: Vertical = "bottom") => showSnackbar(msg, "success", horizontal, vertical);

const Error = (msg: string, horizontal: Horizontal = "right", vertical: Vertical = "bottom") => showSnackbar(msg, "error", horizontal, vertical);

const Info = (msg: string, horizontal: Horizontal = "right", vertical: Vertical = "bottom") => showSnackbar(msg, "info", horizontal, vertical);

const Warning = (msg: string, horizontal: Horizontal = "right", vertical: Vertical = "bottom", autoHideDuration = 2500) =>
   showSnackbar(msg, "warning", horizontal, vertical, autoHideDuration);

const Default = (msg: string, horizontal: Horizontal = "right", vertical: Vertical = "bottom") => showSnackbar(msg, "default", horizontal, vertical);

const Customizable = (msg: string, icon: VariantType = "default", horizontal: Horizontal = "right", vertical: Vertical = "bottom") =>
   showSnackbar(msg, icon, horizontal, vertical);

// Export tipado
export default {
   Success,
   Error,
   Info,
   Warning,
   Default,
   Customizable
};
