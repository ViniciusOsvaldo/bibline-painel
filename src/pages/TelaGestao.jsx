import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function TelaGestao() {
  const [aba, setAba] = useState('membros')
  const [membros, setMembros] = useState([])
  const [projetos, setProjetos] = useState([])
  const [tarefas, setTarefas] = useState([])
  const [carregando, setCarregando] = useState(true)

  const [nomeProjeto, setNomeProjeto] = useState('')
  const [descProjeto, setDescProjeto] = useState('')
  const [frenteProjeto, setFrenteProjeto] = useState('robotica')
  const [inicioProjeto, setInicioProjeto] = useState('')
  const [fimProjeto, setFimProjeto] = useState('')

  const [tituloTarefa, setTituloTarefa] = useState('')
  const [descTarefa, setDescTarefa] = useState('')
  const [projetoTarefa, setProjetoTarefa] = useState('')
  const [responsavelTarefa, setResponsavelTarefa] = useState('')
  const [prazoTarefa, setPrazoTarefa] = useState('')

  const [membroMeta, setMembroMeta] = useState('')
  const [descMeta, setDescMeta] = useState('')
  const [semanaInicioMeta, setSemanaInicioMeta] = useState('')

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    const [m, p, t] = await Promise.all([
      supabase.from('membros').select('*').eq('ativo', true).order('nome'),
      supabase.from('projetos').select('*').order('criado_em', { ascending: false }),
      supabase.from('tarefas').select('*, membros(nome), projetos(nome)').order('criado_em', { ascending: false })
    ])
    setMembros(m.data || [])
    setProjetos(p.data || [])
    setTarefas(t.data || [])
    setCarregando(false)
  }

  async function criarProjeto() {
    if (!nomeProjeto || !inicioProjeto) return
    await supabase.from('projetos').insert({
      nome: nomeProjeto,
      descricao: descProjeto,
      frente: frenteProjeto,
      data_inicio: inicioProjeto,
      data_fim: fimProjeto || null
    })
    setNomeProjeto(''); setDescProjeto(''); setInicioProjeto(''); setFimProjeto('')
    carregarDados()
  }

  async function criarTarefa() {
    if (!tituloTarefa || !responsavelTarefa || !prazoTarefa) return
    await supabase.from('tarefas').insert({
      titulo: tituloTarefa,
      descricao: descTarefa,
      projeto_id: projetoTarefa || null,
      responsavel_id: responsavelTarefa,
      prazo: prazoTarefa
    })
    setTituloTarefa(''); setDescTarefa(''); setProjetoTarefa(''); setResponsavelTarefa(''); setPrazoTarefa('')
    carregarDados()
  }

  async function criarMeta() {
    if (!membroMeta || !descMeta || !semanaInicioMeta) return
    await supabase.from('metas_semanais').insert({
      membro_id: membroMeta,
      descricao: descMeta,
      semana_inicio: semanaInicioMeta
    })
    setMembroMeta(''); setDescMeta(''); setSemanaInicioMeta('')
    alert('Meta criada com sucesso!')
  }

  async function atualizarProgresso(projetoId, valor) {
    const num = Math.min(100, Math.max(0, Number(valor)))
    await supabase.from('projetos').update({ progresso_manual: num }).eq('id', projetoId)
    carregarDados()
  }

  const inputClass = "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
  const labelClass = "block text-gray-400 text-sm mb-1"
  const btnClass = "bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"

  if (carregando) return <p className="text-gray-400">Carregando...</p>

  return (
    <div className="text-white">
      <h1 className="text-2xl font-bold mb-6">Gestão</h1>

      {/* Abas */}
      <div className="flex gap-2 mb-6 border-b border-gray-800 pb-2">
        {['projetos', 'tarefas', 'metas', 'membros'].map(a => (
          <button key={a} onClick={() => setAba(a)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium capitalize transition-colors ${aba === a ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>
            {a === 'projetos' && 'Projetos'}
            {a === 'tarefas' && 'Tarefas'}
            {a === 'metas' && 'Metas Semanais'}
            {a === 'membros' && 'Membros'}
          </button>
        ))}
      </div>

      {/* ABA PROJETOS */}
      {aba === 'projetos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4 text-blue-400">Novo Projeto</h2>
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Nome do projeto *</label>
                <input className={inputClass} value={nomeProjeto} onChange={e => setNomeProjeto(e.target.value)} placeholder="Ex: Vídeo didático de Python" />
              </div>
              <div>
                <label className={labelClass}>Descrição</label>
                <textarea className={inputClass} rows={2} value={descProjeto} onChange={e => setDescProjeto(e.target.value)} placeholder="Descreva o projeto..." />
              </div>
              <div>
                <label className={labelClass}>Frente</label>
                <select className={inputClass} value={frenteProjeto} onChange={e => setFrenteProjeto(e.target.value)}>
                  <option value="robotica">Robótica</option>
                  <option value="design_programacao">Design + Programação</option>
                  <option value="ambos">Ambos</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Data início *</label>
                  <input type="date" className={inputClass} value={inicioProjeto} onChange={e => setInicioProjeto(e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Data fim</label>
                  <input type="date" className={inputClass} value={fimProjeto} onChange={e => setFimProjeto(e.target.value)} />
                </div>
              </div>
              <button onClick={criarProjeto} className={btnClass}>Criar Projeto</button>
            </div>
          </div>

          <div className="bg-gray-900 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4 text-blue-400">Projetos Ativos</h2>
            <div className="space-y-3">
              {projetos.length === 0 && <p className="text-gray-500 text-sm">Nenhum projeto cadastrado.</p>}
              {projetos.map(p => (
                <div key={p.id} className="bg-gray-800 rounded-xl p-4">
                  <div className="font-medium">{p.nome}</div>
                  <div className="text-sm text-gray-400 mt-1">
                    {p.frente === 'robotica' ? 'Robótica' : p.frente === 'design_programacao' ? 'Design + Prog' : 'Ambos'}
                  </div>
                  {p.data_fim && (
                    <div className="text-xs text-gray-500 mt-1">
                      Prazo: {new Date(p.data_fim).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                  <div className="mt-3">
                    <label className="text-xs text-gray-400 mb-1 block">Progresso manual: {p.progresso_manual ?? 0}%</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={p.progresso_manual ?? 0}
                        onChange={e => atualizarProgresso(p.id, e.target.value)}
                        className="flex-1 accent-blue-500"
                      />
                      <span className="text-sm font-bold text-blue-400 w-10 text-right">{p.progresso_manual ?? 0}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                      <div className="h-1.5 rounded-full bg-blue-500 transition-all" style={{ width: `${p.progresso_manual ?? 0}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ABA TAREFAS */}
      {aba === 'tarefas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4 text-green-400">Nova Tarefa</h2>
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Título *</label>
                <input className={inputClass} value={tituloTarefa} onChange={e => setTituloTarefa(e.target.value)} placeholder="Ex: Criar roteiro do vídeo" />
              </div>
              <div>
                <label className={labelClass}>Descrição</label>
                <textarea className={inputClass} rows={2} value={descTarefa} onChange={e => setDescTarefa(e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Projeto (opcional)</label>
                <select className={inputClass} value={projetoTarefa} onChange={e => setProjetoTarefa(e.target.value)}>
                  <option value="">Tarefa avulsa</option>
                  {projetos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Responsável *</label>
                <select className={inputClass} value={responsavelTarefa} onChange={e => setResponsavelTarefa(e.target.value)}>
                  <option value="">Selecione...</option>
                  {membros.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Prazo *</label>
                <input type="date" className={inputClass} value={prazoTarefa} onChange={e => setPrazoTarefa(e.target.value)} />
              </div>
              <button onClick={criarTarefa} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Criar Tarefa</button>
            </div>
          </div>
          <div className="bg-gray-900 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4 text-green-400">Tarefas Recentes</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {tarefas.length === 0 && <p className="text-gray-500 text-sm">Nenhuma tarefa cadastrada.</p>}
              {tarefas.map(t => (
                <div key={t.id} className="bg-gray-800 rounded-xl p-4">
                  <div className="font-medium">{t.titulo}</div>
                  <div className="text-sm text-gray-400 mt-1">{t.membros?.nome} {t.projetos ? `· ${t.projetos.nome}` : '· Avulsa'}</div>
                  <div className="text-xs text-gray-500 mt-1">Prazo: {new Date(t.prazo).toLocaleDateString('pt-BR')}</div>
                  <span className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${
                    t.status === 'concluida' ? 'bg-green-900 text-green-300' :
                    t.status === 'em_andamento' ? 'bg-blue-900 text-blue-300' :
                    t.status === 'bloqueada' ? 'bg-red-900 text-red-300' :
                    'bg-gray-700 text-gray-300'}`}>
                    {t.status === 'a_fazer' ? 'A fazer' : t.status === 'em_andamento' ? 'Em andamento' : t.status === 'concluida' ? 'Concluída' : 'Bloqueada'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ABA METAS */}
      {aba === 'metas' && (
        <div className="bg-gray-900 rounded-2xl p-6 max-w-lg">
          <h2 className="text-lg font-bold mb-4 text-purple-400">Nova Meta Semanal</h2>
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Membro *</label>
              <select className={inputClass} value={membroMeta} onChange={e => setMembroMeta(e.target.value)}>
                <option value="">Selecione...</option>
                {membros.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Meta *</label>
              <textarea className={inputClass} rows={3} value={descMeta} onChange={e => setDescMeta(e.target.value)} placeholder="Descreva a meta da semana..." />
            </div>
            <div>
              <label className={labelClass}>Início da semana *</label>
              <input type="date" className={inputClass} value={semanaInicioMeta} onChange={e => setSemanaInicioMeta(e.target.value)} />
            </div>
            <button onClick={criarMeta} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Criar Meta</button>
          </div>
        </div>
      )}

      {/* ABA MEMBROS */}
      {aba === 'membros' && (
        <div className="bg-gray-900 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4 text-yellow-400">Membros da Equipe</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {membros.map(m => (
              <div key={m.id} className="bg-gray-800 rounded-xl p-4">
                <div className="font-medium">{m.nome}</div>
                <div className="text-sm text-gray-400 mt-1">
                  {m.frente === 'robotica' ? 'Robótica' : m.frente === 'design_programacao' ? 'Design + Prog' : 'Gestor'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}