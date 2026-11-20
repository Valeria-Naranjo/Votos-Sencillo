import { create } from 'zustand'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface Registration {
  id: string
  type: 'ine' | 'documento'
  value: string
  casilla: string
  timestamp: Date
}

interface Casilla {
  id: string
  nombre: string
  ubicacion: string
  responsable: string
  seccion: string
  activa: boolean
}

interface AppState {
  user: User | null
  registrations: Registration[]
  casillas: Casilla[]
  isLoading: boolean
  
  // User Actions
  setUser: (user: User | null) => void
  logout: () => void
  
  // Registration Actions
  addRegistration: (registration: Omit<Registration, 'id' | 'timestamp'>) => void
  checkRegistrationExists: (value: string) => Registration | undefined
  
  // Casillas Actions
  addCasilla: (casilla: Omit<Casilla, 'id' | 'activa'>) => void
  updateCasilla: (id: string, data: Partial<Casilla>) => void
  deleteCasilla: (id: string) => void
}

// Simulated existing registrations
const initialRegistrations: Registration[] = [
  {
    id: '1',
    type: 'ine',
    value: 'ABCD123456HDFMRN01',
    casilla: 'Casilla 0234',
    timestamp: new Date('2024-03-15T10:30:00'),
  },
  {
    id: '2',
    type: 'documento',
    value: 'Juan Perez Garcia',
    casilla: 'Casilla 0567',
    timestamp: new Date('2024-03-16T14:45:00'),
  },
  {
    id: '3',
    type: 'ine',
    value: 'XYZW987654MDFGRL02',
    casilla: 'Casilla 0891',
    timestamp: new Date('2024-03-17T09:15:00'),
  },
  {
    id: '4',
    type: 'documento',
    value: 'Maria Lopez Hernandez',
    casilla: 'Casilla 0234',
    timestamp: new Date('2024-03-17T11:20:00'),
  },
]

// Simulated casillas
const initialCasillas: Casilla[] = [
  {
    id: '1',
    nombre: 'Casilla 0234',
    ubicacion: 'Escuela Primaria Benito Juarez',
    responsable: 'Roberto Sanchez Torres',
    seccion: '0234',
    activa: true,
  },
  {
    id: '2',
    nombre: 'Casilla 0567',
    ubicacion: 'Centro Comunitario Villa Nueva',
    responsable: 'Ana Martinez Lopez',
    seccion: '0567',
    activa: true,
  },
  {
    id: '3',
    nombre: 'Casilla 0891',
    ubicacion: 'Biblioteca Municipal Central',
    responsable: 'Carlos Ramirez Diaz',
    seccion: '0891',
    activa: true,
  },
  {
    id: '4',
    nombre: 'Casilla 1023',
    ubicacion: 'Centro Deportivo Norte',
    responsable: 'Laura Gonzalez Ruiz',
    seccion: '1023',
    activa: false,
  },
]

export const useStore = create<AppState>((set, get) => ({
  user: {
    id: '1',
    name: 'Maria Gonzalez Lopez',
    email: 'maria.gonzalez@ejemplo.gob.mx',
  },
  registrations: initialRegistrations,
  casillas: initialCasillas,
  isLoading: false,

  setUser: (user) => set({ user }),
  
  logout: () => set({ user: null }),
  
  addRegistration: (registration) => {
    const newRegistration: Registration = {
      ...registration,
      id: Date.now().toString(),
      timestamp: new Date(),
    }
    set((state) => ({
      registrations: [...state.registrations, newRegistration],
    }))
  },
  
  checkRegistrationExists: (value) => {
    const { registrations } = get()
    return registrations.find(
      (r) => r.value.toLowerCase() === value.toLowerCase()
    )
  },

  addCasilla: (casilla) => {
    const newCasilla: Casilla = {
      ...casilla,
      id: Date.now().toString(),
      activa: true,
    }
    set((state) => ({
      casillas: [...state.casillas, newCasilla],
    }))
  },

  updateCasilla: (id, data) => {
    set((state) => ({
      casillas: state.casillas.map((c) =>
        c.id === id ? { ...c, ...data } : c
      ),
    }))
  },

  deleteCasilla: (id) => {
    set((state) => ({
      casillas: state.casillas.filter((c) => c.id !== id),
    }))
  },
}))
