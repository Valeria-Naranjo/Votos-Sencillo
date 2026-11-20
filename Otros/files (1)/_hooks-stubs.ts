/**
 * useBallotsData.ts
 * ─────────────────
 * Hook de datos para Ballot, siguiendo exactamente el mismo patrón que
 * useCasillasData y useProjectsData del proyecto.
 *
 * Coloca este archivo en: src/hooks/useBallotsData.ts
 */

import { useMemo } from "react";
import { useGenericData, type GenericDataReturn } from "./useGenericData";
import type { Ballot } from "../domains/models/ballot.model";

export interface BallotsPersistState {}

export interface BallotsExtraState {
  singularName: string;
  pluralName: string;
  formTitle: string;
  textBtnSubmit: string;
}

export interface BallotsExtension {}

export type BallotsDataReturn = GenericDataReturn<
  Ballot,
  BallotsExtension,
  BallotsPersistState,
  BallotsExtraState
>;

const singularName = "Boleta";
const pluralName = "Boletas";

const useBallotsData = (): BallotsDataReturn => {
  const initialState = useMemo<Ballot>(
    () => ({
      id: 0,
      user_id: 0,
      vote_1: null,
      vote_2: null,
      vote_3: null,
      vote_4: null,
      vote_5: null,
      active: true,
      created_at: "",
    }),
    []
  );

  return useGenericData<Ballot, BallotsExtension, BallotsPersistState, BallotsExtraState>({
    initialState,
    prefix: "ballots",
    autoFetch: true,
    persistKey: "ballots-persist",
    extraState: {
      textBtnSubmit: "REGISTRAR",
      singularName,
      pluralName,
      formTitle: `REGISTRAR ${singularName.toUpperCase()}`,
    },
    extension: (_set, _get, _persist) => ({}),
    hooks: {
      afterFetch: (ballots) => ballots.sort((a, b) => b.id - a.id),
      onError: (msg) => console.error("[Ballots]", msg),
    },
  });
};

export default useBallotsData;

// ─────────────────────────────────────────────────────────────────────────────

/**
 * useParticipacionesData.ts
 * ──────────────────────────
 * Coloca este archivo en: src/hooks/useParticipacionesData.ts
 */

import type { Participation } from "../domains/models/participation.model";

export interface ParticipacionesPersistState {}

export interface ParticipacionesExtraState {
  singularName: string;
  pluralName: string;
  formTitle: string;
  textBtnSubmit: string;
}

export interface ParticipacionesExtension {}

export type ParticipacionesDataReturn = GenericDataReturn<
  Participation,
  ParticipacionesExtension,
  ParticipacionesPersistState,
  ParticipacionesExtraState
>;

const useParticipacionesData = (): ParticipacionesDataReturn => {
  const initialState = useMemo<Participation>(
    () => ({
      id: 0,
      type: null,
      curp: "",
      user_id: 0,
      active: true,
      created_at: "",
    }),
    []
  );

  return useGenericData<
    Participation,
    ParticipacionesExtension,
    ParticipacionesPersistState,
    ParticipacionesExtraState
  >({
    initialState,
    prefix: "participaciones",
    autoFetch: true,
    persistKey: "participaciones-persist",
    extraState: {
      textBtnSubmit: "REGISTRAR",
      singularName: "Participación",
      pluralName: "Participaciones",
      formTitle: "REGISTRAR PARTICIPACIÓN",
    },
    extension: (_set, _get, _persist) => ({}),
    hooks: {
      afterFetch: (p) => p.sort((a, b) => b.id - a.id),
      onError: (msg) => console.error("[Participaciones]", msg),
    },
  });
};

export { useParticipacionesData };

// ─────────────────────────────────────────────────────────────────────────────

/**
 * useUsersData.ts
 * ────────────────
 * Coloca este archivo en: src/hooks/useUsersData.ts
 */

import type { User } from "../domains/models/user.model";

export interface UsersPersistState {}

export interface UsersExtraState {
  singularName: string;
  pluralName: string;
  formTitle: string;
  textBtnSubmit: string;
}

export interface UsersExtension {}

const useUsersData = () => {
  const initialState = useMemo<User>(
    () => ({
      id: 0,
      username: "",
      password: "",
      email: "",
      role_id: 0,
      casilla_id: 0,
      confirmPassword: "",
      changePassword: false,
      active: true,
      created_at: "",
    }),
    []
  );

  return useGenericData<User, UsersExtension, UsersPersistState, UsersExtraState>({
    initialState,
    prefix: "users",
    autoFetch: true,
    persistKey: "users-persist",
    extraState: {
      textBtnSubmit: "REGISTRAR",
      singularName: "Usuario",
      pluralName: "Usuarios",
      formTitle: "REGISTRAR USUARIO",
    },
    extension: (_set, _get, _persist) => ({}),
    hooks: {
      afterFetch: (users) =>
        users.sort((a, b) => (a.casilla_district ?? 0) - (b.casilla_district ?? 0)),
      onError: (msg) => console.error("[Users]", msg),
    },
  });
};

export default useUsersData;
