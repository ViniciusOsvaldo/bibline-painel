import { useState } from 'react'
import TelaSelecao from './pages/TelaSelecao'
import TelaVisaoGeral from './pages/TelaVisaoGeral'
import TelaRobotica from './pages/TelaRobotica'
import TelaDesignProg from './pages/TelaDesignProg'
import TelaGestao from './pages/TelaGestao'

export default function App() {
  const [usuario, setUsuario] = useState(null)
  const [tela, setTela] = useState('geral')

  if (!usuario) {
    return <TelaSelecao onSelecionar={setUsuario} />
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navegação */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-blue-400 font-bold text-xl">Bibline</span>
          <span className="text-gray-500 text-sm">Painel de Gestão</span>
        </div>
        <div className="flex gap-2">
          {['geral', 'robotica', 'design', 'gestao'].map(t => (
            <button
              key={t}
              onClick={() => setTela(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tela === t
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {t === 'geral' && 'Visão Geral'}
              {t === 'robotica' && 'Robótica'}
              {t === 'design' && 'Design + Prog'}
              {t === 'gestao' && 'Gestão'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm">Olá, <span className="text-white font-medium">{usuario.nome}</span></span>
          <button
            onClick={() => setUsuario(null)}
            className="text-gray-500 hover:text-white text-sm"
          >
            Sair
          </button>
        </div>
      </nav>

      {/* Conteúdo */}
      <main className="p-6">
        {tela === 'geral' && <TelaVisaoGeral usuario={usuario} />}
        {tela === 'robotica' && <TelaRobotica usuario={usuario} />}
        {tela === 'design' && <TelaDesignProg usuario={usuario} />}
        {tela === 'gestao' && usuario.frente === 'gestor' && <TelaGestao />}
        {tela === 'gestao' && usuario.frente !== 'gestor' && (
          <div className="text-center text-gray-500 mt-20">
            <p className="text-xl">Acesso restrito ao gestor.</p>
          </div>
        )}
      </main>
    </div>
  )
}