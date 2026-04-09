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

  const [editandoProjeto, setEditandoProjeto] = useState(null)
  const [editNome, setEditNome] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editFrente, setEditFrente] = useState('')
  const [editInicio, setEditInicio] = useState('')
  const [editFim, setEditFim] = useState('')

  const [tituloTarefa, setTituloTarefa] = useState('')
  const [descTarefa, setDescTarefa] = useState('')
  const [projetoTarefa, setProjetoTarefa] = useState('')
  const [responsavelTarefa, setResponsavelTarefa] = useState('')
  const [inicioTarefa, setInicioTarefa] = useState('')
  const [prazoTarefa, setPrazoTarefa] = useState('')

  const [membroMeta, setMembroMeta] = useState('')
  const [descMeta, setDescMeta] = useState('')
  const [semanaInicioMeta, setSemanaInicioMeta] = useState('')
  const [semanaFimMeta, setSemanaFimMeta] = useState('')

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    const [m, p, t] = await Promise.all([
      supabase.from('membros').select('*').eq('ativo', true).order('nome'),
      supabase.from('projetos').select('*').order('criado_em', { ascending: false }),
      supabase.from('tarefas').select('*').order('criado_em', { ascending: false })
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

  function iniciarEdicao(p) {
    setEditandoProjeto(p.id)
    setEditNome(p.nome)
    setEditDesc(p.descricao || '')
    setEditFrente(p.frente)
    setEditInicio(p.data_inicio || '')
    setEditFim(p.data_fim || '')
  }

  async function salvarEdicao(projetoId) {
    await supabase.from('projetos').update({
      nome: editNome,
      descricao: editDesc,
      frente: editFrente,
      data_inicio: editInicio,
      data_fim: editFim || null
    }).eq('id', projetoId)
    setEditandoProjeto(null)
    carregarDados()
  }

  async function arquivarProjeto(projetoId) {
    await supabase.from('projetos').update({ status: 'arquivado' }).eq('id', projetoId)
    carregarDados()
  }

  async function desarquivarProjeto(projetoId) {
    await supabase.from('projetos').update({ status: 'ativo' }).eq('id', projetoId)
    carregarDados()
  }

  async function excluirProjeto(projetoId) {
    if (!window.confirm('Tem certeza? Isso vai excluir o projeto e todas as tarefas vinculadas.')) return
    await supabase.from('tarefas').delete().eq('projeto_id', projetoId)
    await supabase.from('projetos').delete().eq('id', projetoId)
    carregarDados()
  }

  async function atualizarProgresso(projetoId, valor) {
    const num = Math.min(100, Math.max(0, Number(valor)))
    await supabase.from('projetos').update({ progresso_manual: num }).eq('id', projetoId)
    carregarDados()
  }

  async function criarTarefa() {
    if (!tituloTarefa || !responsavelTarefa || !prazoTarefa) return
    await supabase.from('tarefas').insert({
      titulo: tituloTarefa,
      descricao: descTarefa,
      projeto_id: projetoTarefa || null,
      responsavel_id: responsavelTarefa,
      data_inicio: inicioTarefa || null,
      prazo: prazoTarefa
    })
    setTituloTarefa(''); setDescTarefa(''); setProjetoTarefa(''); setResponsavelTarefa(''); setInicioTarefa(''); setPrazoTarefa('')
    carregarDados()
  }

  async function excluirTarefa(tarefaId) {
    if (!window.confirm('Tem certeza que deseja excluir esta tarefa?')) return
    await supabase.from('tarefas').delete().eq('id', tarefaId)
    carregarDados()
  }

  async function criarMeta() {
    if (!membroMeta || !descMeta || !semanaInicioMeta) return
    await supabase.from('metas_semanais').insert({
      membro_id: membroMeta,
      descricao: descMeta,
      semana_inicio: semanaInicioMeta,
      data_fim: semanaFimMeta || null
    })
    setMembroMeta(''); setDescMeta(''); setSemanaInicioMeta(''); setSemanaFimMeta('')
    alert('Meta criada com sucesso!')
  }

  const inputClass = "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
  const labelClass = "block text-gray-400 text-sm mb-1"
  const btnClass = "bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"

  const projetosAtivos = projetos.filter(p => p.status === 'ativo')
  const projetosArquivados = projetos.filter(p => p.status === 'arquivado')

  if (carregando) return <p className="text-gray-400">Carregando...</p>

  return (
    <div className="text-white">
      <h1 className="text-2xl font-bold mb-6">Gestão</h1>

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
              {projetosAtivos.length === 0 && <p className="text-gray-500 text-sm">Nenhum projeto ativo.</p>}
              {projetosAtivos.map(p => (
                <div key={p.id} className="bg-gray-800 rounded-xl p-4">
                  {editandoProjeto === p.id ? (
                    <div className="space-y-2">
                      <input className={inputClass} value={editNome} onChange={e => setEditNome(e.target.value)} placeholder="Nome" />
                      <textarea className={inputClass} rows={2} value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Descrição" />
                      <select className={inputClass} value={editFrente} onChange={e => setEditFrente(e.target.value)}>
                        <option value="robotica">Robótica</option>
                        <option value="design_programacao">Design + Programação</option>
                        <option value="ambos">Ambos</option>
                      </select>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="date" className={inputClass} value={editInicio} onChange={e => setEditInicio(e.target.value)} />
                        <input type="date" className={inputClass} value={editFim} onChange={e => setEditFim(e.target.value)} />
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => salvarEdicao(p.id)} className="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium">Salvar</button>
                        <button onClick={() => setEditandoProjeto(null)} className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium">Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="font-medium">{p.nome}</div>
                      <div className="text-sm text-gray-400 mt-1">
                        {p.frente === 'robotica' ? 'Robótica' : p.frente === 'design_programacao' ? 'Design + Prog' : 'Ambos'}
                      </div>
                      {p.data_fim && (
                        <div className="text-xs text-gray-500 mt-1">
                          Prazo: {new Date(p.data_fim + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </div>
                      )}
                      <div className="mt-3">
                        <label className="text-xs text-gray-400 mb-1 block">Progresso manual: {p.progresso_manual ?? 0}%</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="range" min={0} max={100}
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
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => iniciarEdicao(p)} className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg">✏️ Editar</button>
                        <button onClick={() => arquivarProjeto(p.id)} className="text-xs bg-yellow-900 hover:bg-yellow-800 text-yellow-300 px-3 py-1.5 rounded-lg">📦 Arquivar</button>
                        <button onClick={() => excluirProjeto(p.id)} className="text-xs bg-red-900 hover:bg-red-800 text-red-300 px-3 py-1.5 rounded-lg">🗑️ Excluir</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {projetosArquivados.length > 0 && (
              <div className="mt-6">
                <h2 className="text-lg font-bold mb-3 text-gray-500">Projetos Arquivados</h2>
                <div className="space-y-3">
                  {projetosArquivados.map(p => (
                    <div key={p.id} className="bg-gray-800 opacity-60 rounded-xl p-4">
                      <div className="font-medium text-gray-400">{p.nome}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {p.frente === 'robotica' ? 'Robótica' : p.frente === 'design_programacao' ? 'Design + Prog' : 'Ambos'}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => desarquivarProjeto(p.id)} className="text-xs bg-green-900 hover:bg-green-800 text-green-300 px-3 py-1.5 rounded-lg">♻️ Reativar</button>
                        <button onClick={() => excluirProjeto(p.id)} className="text-xs bg-red-900 hover:bg-red-800 text-red-300 px-3 py-1.5 rounded-lg">🗑️ Excluir</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                  {projetosAtivos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Responsável *</label>
                <select className={inputClass} value={responsavelTarefa} onChange={e => setResponsavelTarefa(e.target.value)}>
                  <option value="">Selecione...</option>
                  {membros.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Data início</label>
                  <input type="date" className={inputClass} value={inicioTarefa} onChange={e => setInicioTarefa(e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Prazo *</label>
                  <input type="date" className={inputClass} value={prazoTarefa} onChange={e => setPrazoTarefa(e.target.value)} />
                </div>
              </div>
              <button onClick={criarTarefa} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Criar Tarefa</button>
            </div>
          </div>
          <div className="bg-gray-900 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4 text-green-400">Tarefas Recentes</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {tarefas.length === 0 && <p className="text-gray-500 text-sm">Nenhuma tarefa cadastrada.</p>}
              {tarefas.map(t => {
                const aguardando = t.data_inicio && new Date(t.data_inicio + 'T12:00:00') > new Date()
                const membro = membros.find(m => m.id === t.responsavel_id)
                const projeto = projetos.find(p => p.id === t.projeto_id)
                return (
                  <div key={t.id} className="bg-gray-800 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{t.titulo}</div>
                        {aguardando && <span className="text-xs bg-orange-900 text-orange-300 px-2 py-0.5 rounded-full">⏳ Aguardando início</span>}
                      </div>
                      <button
                        onClick={() => excluirTarefa(t.id)}
                        className="text-xs bg-red-900 hover:bg-red-800 text-red-300 px-2 py-1 rounded-lg ml-2"
                      >
                        🗑️
                      </button>
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      {membro?.nome || 'Sem responsável'} {projeto ? `· ${projeto.nome}` : '· Avulsa'}
                    </div>
                    {t.data_inicio && <div className="text-xs text-gray-500 mt-1">Início: {new Date(t.data_inicio + 'T12:00:00').toLocaleDateString('pt-BR')}</div>}
                    <div className="text-xs text-gray-500 mt-1">Prazo: {new Date(t.prazo + 'T12:00:00').toLocaleDateString('pt-BR')}</div>
                    <span className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${
                      t.status === 'concluida' ? 'bg-green-900 text-green-300' :
                      t.status === 'em_andamento' ? 'bg-blue-900 text-blue-300' :
                      t.status === 'bloqueada' ? 'bg-red-900 text-red-300' :
                      'bg-gray-700 text-gray-300'}`}>
                      {t.status === 'a_fazer' ? 'A fazer' : t.status === 'em_andamento' ? 'Em andamento' : t.status === 'concluida' ? 'Concluída' : 'Bloqueada'}
                    </span>
                  </div>
                )
              })}
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Data início *</label>
                <input type="date" className={inputClass} value={semanaInicioMeta} onChange={e => setSemanaInicioMeta(e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Data fim</label>
                <input type="date" className={inputClass} value={semanaFimMeta} onChange={e => setSemanaFimMeta(e.target.value)} />
              </div>
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