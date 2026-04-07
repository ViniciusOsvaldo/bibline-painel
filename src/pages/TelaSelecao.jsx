import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function TelaSelecao({ onSelecionar }) {
  const [membros, setMembros] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregarMembros() {
      const { data } = await supabase
        .from('membros')
        .select('*')
        .eq('ativo', true)
        .order('nome')
      setMembros(data || [])
      setCarregando(false)
    }
    carregarMembros()
  }, [])

  const cores = {
    gestor: 'bg-purple-600 hover:bg-purple-500',
    robotica: 'bg-blue-600 hover:bg-blue-500',
    design_programacao: 'bg-green-600 hover:bg-green-500',
  }

  const labels = {
    gestor: 'Gestor',
    robotica: 'Robótica',
    design_programacao: 'Design + Prog',
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Bibline</h1>
        <p className="text-gray-400 text-lg">Painel de Gestão da Equipe</p>
        <p className="text-gray-500 mt-2">Quem é você?</p>
      </div>

      {carregando ? (
        <p className="text-gray-400">Carregando membros...</p>
      ) : membros.length === 0 ? (
        <p className="text-gray-400">Nenhum membro cadastrado ainda.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl">
          {membros.map(membro => (
            <button
              key={membro.id}
              onClick={() => onSelecionar(membro)}
              className={`${cores[membro.frente] || 'bg-gray-700 hover:bg-gray-600'} 
                text-white rounded-2xl p-6 text-left transition-all transform hover:scale-105`}
            >
              <div className="text-xl font-bold mb-1">{membro.nome}</div>
              <div className="text-sm opacity-75">{labels[membro.frente] || membro.frente}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}