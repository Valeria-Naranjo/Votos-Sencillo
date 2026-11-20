export interface AccessRole {
   id: number;
   role: string;
   description?: string;
   page_index?: string;
   users_count: number;
   active: boolean;
}

export interface AccessUser {
   id: number;
   username: string;
   email: string;
   role_id: number;
   active: boolean;
   role?: AccessRole;
}

export interface AccessMenu {
   id: number;
   menu: string;
   code: string;
   url?: string;
   read_only?: boolean;
   others_permissions?: string;
   children?: AccessMenu[];
}

export interface AccessPermission {
   menu_id: number;
   can_view: boolean;
   can_create: boolean;
   can_update: boolean;
   can_delete: boolean;
   custom_permissions: string[];
}

export interface RoleDraft {
   role: string;
   description: string;
   page_index: string;
}

export const emptyPermission = (menuId: number): AccessPermission => ({
   menu_id: menuId,
   can_view: false,
   can_create: false,
   can_update: false,
   can_delete: false,
   custom_permissions: []
});

