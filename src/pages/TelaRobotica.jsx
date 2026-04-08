import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function TelaRobotica({ usuario }) {
  const [membros, setMembros] = useState([])
  const [tarefas, setTarefas] = useState([])
  const [projetos, setProjetos] = useState([])
  const [producao, setProducao] = useState([])
  const [descProducao, setDescProducao] = useState('')
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    carregarDados()
    const intervalo = setInterval(carregarDados, 30000)
    return () => clearInterval(intervalo)
  }, [])

  async function carregarDados() {
    const hoje = new Date().toISOString().split('T')[0]
    const [m, p, t, prod] = await Promise.all([
      supabase.from('membros').select('*').eq('frente', 'robotica').eq('ativo', true).order('nome'),
      supabase.from('projetos').select('*').in('frente', ['robotica', 'ambos']).eq('status', 'ativo'),
      supabase.from('tarefas').select('*, membros!inner(nome, frente)').eq('membros.frente', 'robotica'),
      supabase.from('producao_diaria').select('*, membros(nome)').eq('data', hoje)
    ])
    setMembros(m.data || [])
    setProjetos(p.data || [])
    setTarefas(t.data || [])
    setProducao(prod.data || [])
    setCarregando(false)
  }

  async function atualizarStatus(tarefaId, novoStatus) {
    const update = { status: novoStatus }
    if (novoStatus === 'concluida') update.concluida_em = new Date().toISOString()
    await supabase.from('tarefas').update(update).eq('id', tarefaId)
    carregarDados()
  }

  async function registrarProducao() {
    if (!descProducao.trim()) return
    const hoje = new Date().toISOString().split('T')[0]
    await supabase.from('producao_diaria').upsert({
      membro_id: usuario.id,
      data: hoje,
      descricao: descProducao
    }, { onConflict: 'membro_id,data' })
    setDescProducao('')
    carregarDados()
  }

  function getTarefasMembro(membroId) {
    return tarefas.filter(t => t.responsavel_id === membroId)
  }

  function getProgresso(tarefasList) {
    if (tarefasList.length === 0) return 0
    return Math.round((tarefasList.filter(t => t.status === 'concluida').length / tarefasList.length) * 100)
  }

  function getProgressoProjeto(projetoId) {
    const ts = tarefas.filter(t => t.projeto_id === projetoId)
    return getProgresso(ts)
  }

  function getProducaoHoje(membroId) {
    return producao.find(p => p.membro_id === membroId)
  }

  const corStatus = { a_fazer: 'bg-gray-700 text-gray-300', em_andamento: 'bg-blue-900 text-blue-300', concluida: 'bg-green-900 text-green-300', bloqueada: 'bg-red-900 text-red-300' }
  const labelStatus = { a_fazer: 'A fazer', em_andamento: 'Em andamento', concluida: 'Concluída', bloqueada: 'Bloqueada' }

  if (carregando) return <div className="text-gray-400 text-center mt-20">Carregando...</div>

  const minhas = membros.find(m => m.id === usuario.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold"> Frente Robótica</h1>
        <span className="text-sm text-gray-400">{membros.length} membros</span>
      </div>

      {/* Registro de produção do dia */}
      {minhas && (
        <div className="bg-blue-950 border border-blue-800 rounded-2xl p-5">
          <h2 className="text-lg font-bold text-blue-400 mb-3">📝 O que você produziu hoje?</h2>
          {getProducaoHoje(usuario.id) ? (
            <div className="text-blue-300 text-sm">✅ Já registrado: <span className="text-white">{getProducaoHoje(usuario.id).descricao}</span></div>
          ) : (
            <div className="flex gap-3">
              <input
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                placeholder="Descreva o que produziu hoje..."
                value={descProducao}
                onChange={e => setDescProducao(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && registrarProducao()}
              />
              <button onClick={registrarProducao} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Registrar
              </button>
            </div>
          )}
        </div>
      )}

      {/* Projetos */}
      {projetos.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-300 mb-3">Projetos Ativos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projetos.map(p => {
              const pct = getProgressoProjeto(p.id)
              return (
                <div key={p.id} className="bg-gray-900 rounded-2xl p-5">
                  <div className="font-bold text-white mb-1">{p.nome}</div>
                  {p.descricao && <div className="text-sm text-gray-400 mb-3">{p.descricao}</div>}
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-400">Progresso</span>
                    <span className="text-sm font-bold text-blue-400">{pct}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  {p.data_fim && <div className="text-xs text-gray-500 mt-2">Prazo: {new Date(p.data_fim).toLocaleDateString('pt-BR')}</div>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Membros e tarefas */}
      <div>
        <h2 className="text-lg font-bold text-gray-300 mb-3">Membros</h2>
        <div className="space-y-4">
          {membros.map(m => {
            const ts = getTarefasMembro(m.id)
            const pct = getProgresso(ts)
            const ehVoce = usuario.id === m.id
            const prodHoje = getProducaoHoje(m.id)

            return (
              <div key={m.id} className="bg-gray-900 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-lg">{m.nome}</span>
                    {ehVoce && <span className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded-full">Você</span>}
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-blue-400">{pct}%</span>
                    {prodHoje && <div className="text-xs text-gray-400 mt-0.5">✅ Registrou hoje</div>}
                  </div>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1.5 mb-4">
                  <div className="h-1.5 rounded-full bg-blue-500 transition-all" style={{ width: `${pct}%` }} />
                </div>

                {ts.length === 0 ? (
                  <p className="text-gray-500 text-sm">Sem tarefas esta semana.</p>
                ) : (
                  <div className="space-y-2">
                    {ts.map(t => (
                      <div key={t.id} className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3">
                        <div>
                          <div className="text-sm font-medium text-white">{t.titulo}</div>
                          {t.prazo && <div className="text-xs text-gray-500 mt-0.5">Prazo: {new Date(t.prazo).toLocaleDateString('pt-BR')}</div>}
                        </div>
                        {ehVoce ? (
                          <select
                            value={t.status}
                            onChange={e => atualizarStatus(t.id, e.target.value)}
                            className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                          >
                            <option value="a_fazer">A fazer</option>
                            <option value="em_andamento">Em andamento</option>
                            <option value="concluida">Concluída</option>
                            <option value="bloqueada">Bloqueada</option>
                          </select>
                        ) : (
                          <span className={`text-xs px-2 py-1 rounded-full ${corStatus[t.status]}`}>{labelStatus[t.status]}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}