import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { 
  Users, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  MapPin, 
  User,
  Building,
  X
} from 'lucide-react'
import Swal from 'sweetalert2'
import { useStore } from '../store/useStore'

const validationSchema = Yup.object({
  nombre: Yup.string()
    .required('El nombre es requerido')
    .min(3, 'Minimo 3 caracteres'),
  ubicacion: Yup.string()
    .required('La ubicacion es requerida'),
  responsable: Yup.string()
    .required('El responsable es requerido'),
  seccion: Yup.string()
    .required('La seccion es requerida')
    .matches(/^\d{4}$/, 'Debe ser un numero de 4 digitos'),
})

export function CasillasPage() {
  const { casillas, addCasilla, updateCasilla, deleteCasilla } = useStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCasilla, setEditingCasilla] = useState<string | null>(null)

  const formik = useFormik({
    initialValues: {
      nombre: '',
      ubicacion: '',
      responsable: '',
      seccion: '',
    },
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      if (editingCasilla) {
        updateCasilla(editingCasilla, values)
        Swal.fire({
          title: 'Casilla actualizada',
          text: 'La casilla se ha actualizado correctamente',
          icon: 'success',
          confirmButtonColor: '#9B2242',
          timer: 2000,
          showConfirmButton: false,
        })
      } else {
        addCasilla(values)
        Swal.fire({
          title: 'Casilla registrada',
          text: 'La nueva casilla se ha registrado correctamente',
          icon: 'success',
          confirmButtonColor: '#9B2242',
          timer: 2000,
          showConfirmButton: false,
        })
      }
      resetForm()
      setIsModalOpen(false)
      setEditingCasilla(null)
    },
  })

  const handleEdit = (casilla: typeof casillas[0]) => {
    setEditingCasilla(casilla.id)
    formik.setValues({
      nombre: casilla.nombre,
      ubicacion: casilla.ubicacion,
      responsable: casilla.responsable,
      seccion: casilla.seccion,
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id: string, nombre: string) => {
    Swal.fire({
      title: 'Eliminar casilla',
      text: `Esta seguro de eliminar ${nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#9B2242',
      cancelButtonColor: '#727372',
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        deleteCasilla(id)
        Swal.fire({
          title: 'Eliminada',
          text: 'La casilla ha sido eliminada',
          icon: 'success',
          confirmButtonColor: '#9B2242',
          timer: 2000,
          showConfirmButton: false,
        })
      }
    })
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingCasilla(null)
    formik.resetForm()
  }

  const filteredCasillas = casillas.filter(
    (c) =>
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ubicacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.seccion.includes(searchTerm)
  )

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
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
              Catalogo de Casillas
            </h1>
            <p className="text-gris mt-1">Administracion de casillas electorales</p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-guinda-primary to-guinda-secondary text-white rounded-xl font-medium shadow-lg shadow-guinda-primary/25 hover:shadow-xl transition-shadow"
          >
            <Plus size={20} />
            Nueva Casilla
          </motion.button>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gris" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre, ubicacion o seccion..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gris-claro/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-guinda-primary/30 focus:border-guinda-primary transition-all bg-white"
          />
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        <div className="bg-white rounded-xl p-4 border border-gris-claro/30 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-guinda-primary/10 rounded-lg flex items-center justify-center">
              <Building className="text-guinda-primary" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-negro">{casillas.length}</p>
              <p className="text-xs text-gris">Total Casillas</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gris-claro/30 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-negro">{casillas.filter(c => c.activa).length}</p>
              <p className="text-xs text-gris">Activas</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-2xl border border-gris-claro/30 shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-guinda-primary/5 to-guinda-secondary/5 border-b border-gris-claro/30">
                <th className="text-left px-6 py-4 text-sm font-semibold text-negro">Casilla</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-negro hidden md:table-cell">Ubicacion</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-negro hidden lg:table-cell">Responsable</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-negro">Seccion</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-negro">Estado</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-negro">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredCasillas.map((casilla) => (
                  <motion.tr
                    key={casilla.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, x: -20 }}
                    className="border-b border-gris-claro/20 hover:bg-gris-claro/10 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-guinda-primary/10 rounded-lg flex items-center justify-center">
                          <Building className="text-guinda-primary" size={18} />
                        </div>
                        <div>
                          <p className="font-medium text-negro">{casilla.nombre}</p>
                          <p className="text-xs text-gris md:hidden">{casilla.ubicacion}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-2 text-gris">
                        <MapPin size={14} />
                        <span className="text-sm">{casilla.ubicacion}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-2 text-gris">
                        <User size={14} />
                        <span className="text-sm">{casilla.responsable}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-gris-claro/30 rounded-full text-sm font-medium text-negro">
                        {casilla.seccion}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        casilla.activa 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {casilla.activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEdit(casilla)}
                          className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                        >
                          <Edit2 size={18} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(casilla.id, casilla.nombre)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                        >
                          <Trash2 size={18} />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredCasillas.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-12 text-center"
          >
            <Users className="mx-auto text-gris-claro mb-4" size={48} />
            <p className="text-gris font-medium">No se encontraron casillas</p>
            <p className="text-sm text-gris-claro">Intente con otro termino de busqueda</p>
          </motion.div>
        )}
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="fixed inset-0 bg-negro/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-6 border-b border-gris-claro/30 bg-gradient-to-r from-guinda-primary/5 to-guinda-secondary/5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-negro" style={{ fontFamily: 'Georgia, serif' }}>
                    {editingCasilla ? 'Editar Casilla' : 'Nueva Casilla'}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 rounded-lg hover:bg-gris-claro/30 text-gris transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <form onSubmit={formik.handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-negro mb-2">
                    Nombre de la Casilla
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formik.values.nombre}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Ej: Casilla 0234"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      formik.touched.nombre && formik.errors.nombre
                        ? 'border-red-400 focus:ring-red-200'
                        : 'border-gris-claro/50 focus:ring-guinda-primary/30 focus:border-guinda-primary'
                    }`}
                  />
                  {formik.touched.nombre && formik.errors.nombre && (
                    <p className="text-red-500 text-xs mt-1">{formik.errors.nombre}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-negro mb-2">
                    Ubicacion
                  </label>
                  <input
                    type="text"
                    name="ubicacion"
                    value={formik.values.ubicacion}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Ej: Escuela Primaria Benito Juarez"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      formik.touched.ubicacion && formik.errors.ubicacion
                        ? 'border-red-400 focus:ring-red-200'
                        : 'border-gris-claro/50 focus:ring-guinda-primary/30 focus:border-guinda-primary'
                    }`}
                  />
                  {formik.touched.ubicacion && formik.errors.ubicacion && (
                    <p className="text-red-500 text-xs mt-1">{formik.errors.ubicacion}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-negro mb-2">
                    Responsable
                  </label>
                  <input
                    type="text"
                    name="responsable"
                    value={formik.values.responsable}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Ej: Juan Perez Lopez"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      formik.touched.responsable && formik.errors.responsable
                        ? 'border-red-400 focus:ring-red-200'
                        : 'border-gris-claro/50 focus:ring-guinda-primary/30 focus:border-guinda-primary'
                    }`}
                  />
                  {formik.touched.responsable && formik.errors.responsable && (
                    <p className="text-red-500 text-xs mt-1">{formik.errors.responsable}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-negro mb-2">
                    Seccion Electoral
                  </label>
                  <input
                    type="text"
                    name="seccion"
                    value={formik.values.seccion}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Ej: 1234"
                    maxLength={4}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      formik.touched.seccion && formik.errors.seccion
                        ? 'border-red-400 focus:ring-red-200'
                        : 'border-gris-claro/50 focus:ring-guinda-primary/30 focus:border-guinda-primary'
                    }`}
                  />
                  {formik.touched.seccion && formik.errors.seccion && (
                    <p className="text-red-500 text-xs mt-1">{formik.errors.seccion}</p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-3 border border-gris-claro rounded-xl text-gris font-medium hover:bg-gris-claro/20 transition-colors"
                  >
                    Cancelar
                  </button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-guinda-primary to-guinda-secondary text-white rounded-xl font-medium shadow-lg shadow-guinda-primary/25"
                  >
                    {editingCasilla ? 'Actualizar' : 'Registrar'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
