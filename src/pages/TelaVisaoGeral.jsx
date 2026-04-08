import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

export default function TelaVisaoGeral({ usuario }) {
  const [membros, setMembros] = useState([])
  const [tarefas, setTarefas] = useState([])
  const [metas, setMetas] = useState([])
  const [producao, setProducao] = useState([])
  const [carregando, setCarregando] = useState(true)

  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  useEffect(() => {
    carregarDados()
    const intervalo = setInterval(carregarDados, 30000)
    return () => clearInterval(intervalo)
  }, [])

 async function carregarDados() {
  try {
    const hoje = new Date()
    const segunda = new Date(hoje)
    segunda.setDate(hoje.getDate() - ((hoje.getDay() + 6) % 7))
    const semanaInicio = `${segunda.getFullYear()}-${String(segunda.getMonth() + 1).padStart(2, '0')}-${String(segunda.getDate()).padStart(2, '0')}`

    const [m, t, mt, p] = await Promise.all([
      supabase.from('membros').select('*').eq('ativo', true).order('nome'),
      supabase.from('tarefas').select('*, membros(nome, frente)').gte('prazo', semanaInicio),
      supabase.from('metas_semanais').select('*, membros(nome)').eq('semana_inicio', semanaInicio),
      supabase.from('producao_diaria').select('*, membros(nome)').gte('data', semanaInicio)
    ])

    setMembros(m.data || [])
    setTarefas(t.data || [])
    setMetas(mt.data || [])
    setProducao(p.data || [])
  } catch (erro) {
    console.error('Erro ao carregar dados:', erro)
  } finally {
    setCarregando(false)
  }
}

  function getTarefasMembro(membroId) {
    return tarefas.filter(t => t.responsavel_id === membroId)
  }

  function getProgressoMembro(membroId) {
    const ts = getTarefasMembro(membroId)
    if (ts.length === 0) return 0
    const concluidas = ts.filter(t => t.status === 'concluida').length
    return Math.round((concluidas / ts.length) * 100)
  }

  function getMetaMembro(membroId) {
    return metas.find(m => m.membro_id === membroId)
  }

  function getProducaoHoje(membroId) {
    const hoje = new Date().toISOString().split('T')[0]
    return producao.find(p => p.membro_id === membroId && p.data === hoje)
  }

  function getTarefasAntecipadas() {
    return tarefas.filter(t => {
      if (t.status !== 'concluida' || !t.concluida_em || !t.prazo) return false
      return new Date(t.concluida_em) < new Date(t.prazo)
    })
  }

  function getDadosGrafico() {
    const dias = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex']
    const hoje = new Date()
    const segunda = new Date(hoje)
    segunda.setDate(hoje.getDate() - ((hoje.getDay() + 6) % 7))

    return dias.map((dia, i) => {
      const data = new Date(segunda)
      data.setDate(segunda.getDate() + i)
      const dataStr = data.toISOString().split('T')[0]
      const count = producao.filter(p => p.data === dataStr).length
      return { dia, registros: count, meta: membros.length }
    })
  }

  const totalTarefas = tarefas.length
  const tarefasConcluidas = tarefas.filter(t => t.status === 'concluida').length
  const percentualGeral = totalTarefas > 0 ? Math.round((tarefasConcluidas / totalTarefas) * 100) : 0
  const antecipadas = getTarefasAntecipadas()
  const dadosGrafico = getDadosGrafico()

  const corStatus = (pct) => pct >= 80 ? 'text-green-400' : pct >= 50 ? 'text-yellow-400' : 'text-red-400'
  const corBarra = (pct) => pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'

  if (carregando) return <div className="text-gray-400 text-center mt-20">Carregando painel...</div>

  return (
    <div className="space-y-6">

      {/* BLOCO 1 - Visão Geral da Semana */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900 rounded-2xl p-6 text-center">
          <div className={`text-5xl font-bold ${corStatus(percentualGeral)}`}>{percentualGeral}%</div>
          <div className="text-gray-400 mt-2 text-sm">Progresso da semana</div>
          <div className="w-full bg-gray-800 rounded-full h-2 mt-3">
            <div className={`h-2 rounded-full ${corBarra(percentualGeral)}`} style={{ width: `${percentualGeral}%` }} />
          </div>
        </div>
        <div className="bg-gray-900 rounded-2xl p-6 text-center">
          <div className="text-5xl font-bold text-blue-400">{tarefasConcluidas}<span className="text-2xl text-gray-500">/{totalTarefas}</span></div>
          <div className="text-gray-400 mt-2 text-sm">Tarefas concluídas esta semana</div>
        </div>
        <div className="bg-gray-900 rounded-2xl p-6 text-center">
          <div className="text-5xl font-bold text-yellow-400">{antecipadas.length}</div>
          <div className="text-gray-400 mt-2 text-sm">Entregas antes do prazo 🏆</div>
        </div>
      </div>

      {/* BLOCO 2 - Cards individuais */}
      <div>
        <h2 className="text-lg font-bold text-gray-300 mb-3">Equipe</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {membros.map(m => {
            const pct = getProgressoMembro(m.id)
            const meta = getMetaMembro(m.id)
            const hoje = getProducaoHoje(m.id)
            const ts = getTarefasMembro(m.id)
            const bloqueadas = ts.filter(t => t.status === 'bloqueada').length

            return (
              <div key={m.id} className="bg-gray-900 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-white">{m.nome}</div>
                  {bloqueadas > 0 && <span className="text-xs bg-red-900 text-red-300 px-2 py-0.5 rounded-full">⚠ {bloqueadas}</span>}
                </div>
                <div className={`text-2xl font-bold ${corStatus(pct)}`}>{pct}%</div>
                <div className="w-full bg-gray-800 rounded-full h-1.5 mt-1 mb-3">
                  <div className={`h-1.5 rounded-full ${corBarra(pct)}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="text-xs text-gray-500 mb-1">Meta da semana:</div>
                <div className="text-xs text-gray-300">{meta ? meta.descricao : 'Sem meta definida'}</div>
                <div className="text-xs text-gray-500 mt-2 mb-1">Hoje:</div>
                <div className="text-xs text-gray-300">{hoje ? hoje.descricao : 'Sem registro hoje'}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* BLOCO 3 - Gráfico de produção */}
      <div className="bg-gray-900 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-gray-300 mb-4">Produção da Semana</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={dadosGrafico}>
            <XAxis dataKey="dia" stroke="#6b7280" />
            <YAxis stroke="#6b7280" allowDecimals={false} />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
            <ReferenceLine y={membros.length} stroke="#3b82f6" strokeDasharray="4 4" label={{ value: 'Meta', fill: '#3b82f6', fontSize: 12 }} />
            <Bar dataKey="registros" fill="#10b981" radius={[4, 4, 0, 0]} name="Registros" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* BLOCO 4 - Mural de conquistas */}
      {antecipadas.length > 0 && (
        <div className="bg-yellow-950 border border-yellow-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-yellow-400 mb-4">🏆 Mural de Conquistas</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {antecipadas.map(t => {
              const diasAntes = Math.ceil((new Date(t.prazo) - new Date(t.concluida_em)) / (1000 * 60 * 60 * 24))
              return (
                <div key={t.id} className="bg-yellow-900 rounded-xl p-3">
                  <div className="font-medium text-yellow-100 text-sm">{t.titulo}</div>
                  <div className="text-yellow-300 text-xs mt-1">{t.membros?.nome}</div>
                  <div className="text-yellow-400 text-xs mt-1">+{diasAntes} dia(s) antes do prazo</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* BLOCO 5 - Alertas */}
      {tarefas.filter(t => t.status === 'bloqueada').length > 0 && (
        <div className="bg-red-950 border border-red-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-red-400 mb-4">⚠ Alertas</h2>
          <div className="space-y-2">
            {tarefas.filter(t => t.status === 'bloqueada').map(t => (
              <div key={t.id} className="flex items-center gap-3 bg-red-900 rounded-xl p-3">
                <span className="text-red-300 text-sm font-medium">{t.titulo}</span>
                <span className="text-red-400 text-xs">— {t.membros?.nome}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}