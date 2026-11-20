import { useMemo } from "react";
import { useGenericData } from "./useGenericData";
import type { VotingEvent } from "../domains/models/event.model";

const useEventsData = () => {
   const initialState = useMemo<VotingEvent>(() => ({
      id: 0,
      name: "",
      logo_path: null,
      event_type: "attendance",
      max_votes: 5,
      starts_at: null,
      ends_at: null,
      active: true
   }), []);

   return useGenericData<VotingEvent, {}, {}, { singularName: string; pluralName: string; formTitle: string; textBtnSubmit: string }>({
      initialState,
      prefix: "events",
      autoFetch: true,
      persistKey: "events-persist",
      extraState: { singularName: "Evento", pluralName: "Eventos", formTitle: "Configurar evento", textBtnSubmit: "GUARDAR EVENTO" },
      extension: () => ({}),
      hooks: { afterFetch: (items) => items.sort((a, b) => b.id - a.id), beforeDelete: () => true, onError: console.error }
   });
};

export default useEventsData;
