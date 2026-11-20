import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ListChecks, 
  Search, 
  Filter,
  Calendar,
  CreditCard,
  FileText,
  Download,
  Eye,
  ChevronDown,
  X
} from 'lucide-react'
import { useStore } from '../store/useStore'

export function ParticipacionesPage() {
  const { registrations } = useStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'ine' | 'documento'>('all')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedRegistration, setSelectedRegistration] = useState<typeof registrations[0] | null>(null)

  const filteredRegistrations = registrations.filter((r) => {
    const matchesSearch = 
      r.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.casilla.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || r.type === filterType
    return matchesSearch && matchesType
  })

  const stats = {
    total: registrations.length,
    ine: registrations.filter(r => r.type === 'ine').length,
    documento: registrations.filter(r => r.type === 'documento').length,
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-negro" style={{ fontFamily: 'Georgia, serif' }}>
              Participaciones Registradas
            </h1>
            <p className="text-gris mt-1">Historial de registros ciudadanos</p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gris-claro rounded-xl font-medium text-gris-cool hover:bg-gris-claro/20 transition-colors shadow-sm"
          >
            <Download size={20} />
            Exportar
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
      >
        <div className="bg-white rounded-xl p-5 border border-gris-claro/30 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gris mb-1">Total Registros</p>
              <p className="text-3xl font-bold text-negro">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-guinda-primary/10 rounded-xl flex items-center justify-center">
              <ListChecks className="text-guinda-primary" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gris-claro/30 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gris mb-1">Por INE</p>
              <p className="text-3xl font-bold text-negro">{stats.ine}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CreditCard className="text-green-600" size={24} />
            </div>
          </div>
          <div className="mt-3 w-full bg-gris-claro/30 rounded-full h-2">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: stats.total > 0 ? `${(stats.ine / stats.total) * 100}%` : '0%' }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="bg-green-500 h-2 rounded-full"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gris-claro/30 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gris mb-1">Por Documento</p>
              <p className="text-3xl font-bold text-negro">{stats.documento}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText className="text-blue-600" size={24} />
            </div>
          </div>
          <div className="mt-3 w-full bg-gris-claro/30 rounded-full h-2">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: stats.total > 0 ? `${(stats.documento / stats.total) * 100}%` : '0%' }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="bg-blue-500 h-2 rounded-full"
            />
          </div>
        </div>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4 mb-6"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gris" size={20} />
          <input
            type="text"
            placeholder="Buscar por clave, nombre o casilla..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gris-claro/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-guinda-primary/30 focus:border-guinda-primary transition-all bg-white"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 px-4 py-3 bg-white border border-gris-claro/50 rounded-xl hover:border-guinda-primary transition-colors"
          >
            <Filter size={20} className="text-gris" />
            <span className="text-negro">
              {filterType === 'all' ? 'Todos' : filterType === 'ine' ? 'INE' : 'Documento'}
            </span>
            <ChevronDown size={16} className={`text-gris transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gris-claro/30 overflow-hidden z-20"
              >
                {['all', 'ine', 'documento'].map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setFilterType(type as typeof filterType)
                      setIsFilterOpen(false)
                    }}
                    className={`w-full px-4 py-3 text-left text-sm hover:bg-gris-claro/20 transition-colors ${
                      filterType === type ? 'bg-guinda-primary/10 text-guinda-primary font-medium' : 'text-negro'
                    }`}
                  >
                    {type === 'all' ? 'Todos' : type === 'ine' ? 'INE' : 'Documento'}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Registrations List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        <AnimatePresence>
          {filteredRegistrations.map((registration) => (
            <motion.div
              key={registration.id}
              variants={itemVariants}
              layout
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-xl border border-gris-claro/30 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4">
                {/* Type Badge */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  registration.type === 'ine' 
                    ? 'bg-green-100' 
                    : 'bg-blue-100'
                }`}>
                  {registration.type === 'ine' 
                    ? <CreditCard className="text-green-600" size={24} /> 
                    : <FileText className="text-blue-600" size={24} />
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      registration.type === 'ine' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {registration.type === 'ine' ? 'INE' : 'Documento'}
                    </span>
                    <span className="px-2 py-0.5 bg-gris-claro/30 rounded-full text-xs font-medium text-negro">
                      {registration.casilla}
                    </span>
                  </div>
                  <p className="font-medium text-negro truncate">
                    {registration.type === 'ine' ? 'Clave: ' : 'Nombre: '}
                    <span className="text-guinda-primary">{registration.value}</span>
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gris mt-1">
                    <Calendar size={12} />
                    <span>{formatDate(registration.timestamp)}</span>
                  </div>
                </div>

                {/* Actions */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedRegistration(registration)}
                  className="flex items-center gap-2 px-4 py-2 border border-guinda-primary text-guinda-primary rounded-lg hover:bg-guinda-primary/10 transition-colors text-sm font-medium"
                >
                  <Eye size={16} />
                  Ver detalle
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredRegistrations.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl border border-gris-claro/30 p-12 text-center"
          >
            <ListChecks className="mx-auto text-gris-claro mb-4" size={48} />
            <p className="text-gris font-medium">No se encontraron registros</p>
            <p className="text-sm text-gris-claro">Intente con otros filtros de busqueda</p>
          </motion.div>
        )}
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedRegistration && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRegistration(null)}
              className="fixed inset-0 bg-negro/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-6 border-b border-gris-claro/30 bg-gradient-to-r from-guinda-primary/5 to-guinda-secondary/5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-negro" style={{ fontFamily: 'Georgia, serif' }}>
                    Detalle de Registro
                  </h2>
                  <button
                    onClick={() => setSelectedRegistration(null)}
                    className="p-2 rounded-lg hover:bg-gris-claro/30 text-gris transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                    selectedRegistration.type === 'ine' 
                      ? 'bg-green-100' 
                      : 'bg-blue-100'
                  }`}>
                    {selectedRegistration.type === 'ine' 
                      ? <CreditCard className="text-green-600" size={28} /> 
                      : <FileText className="text-blue-600" size={28} />
                    }
                  </div>
                  <div>
                    <p className="text-sm text-gris">Tipo de Identificacion</p>
                    <p className="font-semibold text-negro">
                      {selectedRegistration.type === 'ine' ? 'Credencial INE' : 'Documento Oficial'}
                    </p>
                  </div>
                </div>

                <div className="bg-gris-claro/10 rounded-xl p-4 space-y-3">
                  <div>
                    <p className="text-xs text-gris uppercase tracking-wide mb-1">
                      {selectedRegistration.type === 'ine' ? 'Clave Electoral' : 'Nombre Completo'}
                    </p>
                    <p className="font-mono text-lg text-guinda-primary font-medium">
                      {selectedRegistration.value}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gris uppercase tracking-wide mb-1">Casilla</p>
                    <p className="font-medium text-negro">{selectedRegistration.casilla}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gris uppercase tracking-wide mb-1">Fecha de Registro</p>
                    <p className="font-medium text-negro">{formatDate(selectedRegistration.timestamp)}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gris uppercase tracking-wide mb-1">ID de Registro</p>
                    <p className="font-mono text-sm text-gris">{selectedRegistration.id}</p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedRegistration(null)}
                  className="w-full py-3 bg-gradient-to-r from-guinda-primary to-guinda-secondary text-white rounded-xl font-medium shadow-lg shadow-guinda-primary/25"
                >
                  Cerrar
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
