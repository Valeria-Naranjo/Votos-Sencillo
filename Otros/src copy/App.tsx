import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { RegistroPage } from './pages/RegistroPage'
import { CasillasPage } from './pages/CasillasPage'
import { ParticipacionesPage } from './pages/ParticipacionesPage'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-pattern flex">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          <Header />
          
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<RegistroPage />} />
              <Route path="/casillas" element={<CasillasPage />} />
              <Route path="/participaciones" element={<ParticipacionesPage />} />
            </Routes>
          </main>
        </div>

        {/* Decorative Elements */}
        <div className="fixed bottom-0 left-0 w-64 h-64 bg-guinda-primary/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
        <div className="fixed top-1/4 right-0 w-96 h-96 bg-guinda-secondary/5 rounded-full blur-3xl translate-x-1/2 pointer-events-none"></div>
      </div>
    </BrowserRouter>
  )
}

export default App
