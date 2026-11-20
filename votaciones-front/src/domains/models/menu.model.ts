export interface MenuItem {
   id: number;
   menu: string;
   code?: string | null;
   caption?: string | null;
   type: "group" | "item";
   belongs_to: number;
   patern?: string | null;
   url?: string | null;
   icon?: string | null;
   order: number;
   show_counter: boolean;
   counter_name?: string | null;
   others_permissions?: string | null;
   read_only: boolean;
   active: boolean;
}

export type MenuFormValues = Omit<MenuItem, "id" | "patern" | "active">;

export const menuFormDefaults: MenuFormValues = {
   menu: "",
   code: "",
   caption: "",
   type: "item",
   belongs_to: 0,
   url: "",
   icon: "",
   order: 1,
   show_counter: false,
   counter_name: "",
   others_permissions: "",
   read_only: false
};
