import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api';
import AdminModal from '../../components/common/AdminModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ClienteCard from '../../components/admin/ClienteCard';
import ClienteProyectoForm from '../../components/admin/ClienteProyectoForm';
import { PlusCircle, Search } from 'lucide-react';

const MODAL_TITLES = {
  cliente_new:   'Nuevo Cliente',
  cliente_edit:  'Editar Cliente',
  proyecto_new:  'Nuevo Proyecto',
  proyecto_edit: 'Editar Proyecto',
  tarea_new:     'Nueva Tarea',
  tarea_edit:    'Editar Tarea',
};

export default function GestionClientes() {
  const [clientesConProyectos, setClientesConProyectos] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modal, setModal]         = useState(null);   // { tipo, data }
  const [saveError, setSaveError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // ─── Load ───────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await api.get('/clientes-con-proyectos');
    setClientesConProyectos(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ─── Modal helpers ──────────────────────────────────────
  const openModal = (tipo, data = {}) => {
    setSaveError(null);
    setModal({ tipo, data });
    setIsModalOpen(true);
  };
  const closeModal = () => { setIsModalOpen(false); setModal(null); };

  const modalKey = modal
    ? `${modal.tipo}_${modal.data?.clienteid || modal.data?.proyectoid || modal.data?.tareaid ? 'edit' : 'new'}`
    : '';

  // ─── Save ────────────────────────────────────────────────
  const handleSave = async (formData) => {
    setSaveError(null);
    try {
      const { tipo } = modal;

      if (tipo === 'cliente') {
        const payload = {
          nombrecliente:   formData.nombrecliente?.trim(),
          parentclienteid: formData.parentclienteid ? Number(formData.parentclienteid) : null,
          activo:          formData.activo !== undefined ? formData.activo : true,
        };
        if (modal.data?.clienteid) {
          await api.put(`/clientes/${modal.data.clienteid}`, payload);
        } else {
          await api.post('/clientes', payload);
        }
      }

      if (tipo === 'proyecto') {
        const payload = {
          nombreproyecto:     formData.nombreproyecto?.trim(),
          clienteid:          Number(formData.clienteid),
          referenciacaseware: formData.referenciacaseware?.trim() || null,
          activo:             formData.activo !== undefined ? formData.activo : true,
        };
        if (modal.data?.proyectoid) {
          await api.put(`/proyectos/${modal.data.proyectoid}`, payload);
        } else {
          await api.post('/proyectos', payload);
        }
      }

      if (tipo === 'tarea') {
        const payload = {
          descripciontarea: formData.descripciontarea?.trim(),
          proyectoid:       Number(formData.proyectoid),
          escargable:       formData.escargable !== false,
          codigo_tarea:     formData.codigo_tarea?.trim() || null,
        };
        if (modal.data?.tareaid) {
          await api.put(`/tareas/${modal.data.tareaid}`, payload);
        } else {
          await api.post('/tareas', payload);
        }
      }

      await loadData();
      closeModal();
    } catch (err) {
      let msg = err.message;
      try { const parsed = JSON.parse(msg); msg = parsed.error || msg; } catch (_) { /* noop */ }
      setSaveError(msg || 'Error al guardar.');
      throw err;
    }
  };

  // ─── Toggle handlers ─────────────────────────────────────
  const handleToggleCliente  = async (c) => { await api.put(`/clientes/${c.clienteid}`, { activo: !c.activo }); await loadData(); };
  const handleToggleProyecto = async (p) => { await api.put(`/proyectos/${p.proyectoid}`, { activo: !p.activo }); await loadData(); };
  const handleToggleTarea    = async (t) => { await api.put(`/tareas/${t.tareaid}`, { escargable: t.escargable }); await loadData(); };

  // ─── Open shortcuts ──────────────────────────────────────
  const onAddProyecto  = (cliente) => openModal('proyecto', { clienteid: cliente.clienteid });
  const onEditProyecto = (proy)    => openModal('proyecto', proy);
  const onAddTarea     = (proy)    => openModal('tarea',    { proyectoid: proy.proyectoid, _nombreProyecto: proy.nombreproyecto });
  const onEditTarea    = (tarea)   => openModal('tarea',    tarea);

  // ─── Stats ───────────────────────────────────────────────
  const totalProyectos = clientesConProyectos.reduce((s, c) => s + c.proyectos.length, 0);
  const totalTareas    = clientesConProyectos.reduce((s, c) => s + c.proyectos.reduce((ss, p) => ss + (p.tareas?.length || 0), 0), 0);

  const filtered = clientesConProyectos.filter(c =>
    c.nombrecliente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="admin-page-header">
        <div>
          <h2 style={{ marginBottom: '2px' }}>Clientes, Proyectos y Tareas</h2>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#b4b7bd' }}>
            {clientesConProyectos.length} clientes · {totalProyectos} proyectos · {totalTareas} tareas
          </p>
        </div>
        <button className="btn btn-primary d-inline-flex align-items-center gap-2"
          onClick={() => openModal('cliente')}>
          <PlusCircle size={16} /> Nuevo Cliente
        </button>
      </div>

      {/* ── Search bar ── */}
      <div className="card mb-4" style={{ borderRadius: 8 }}>
        <div className="card-body py-2 d-flex align-items-center gap-2">
          <Search size={15} className="text-muted flex-shrink-0" />
          <input
            type="text"
            className="form-control border-0 shadow-none p-0"
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ fontSize: '0.9rem' }}
          />
          {searchTerm && (
            <button className="btn btn-sm btn-light" onClick={() => setSearchTerm('')}>✕</button>
          )}
        </div>
      </div>

      {/* ── Cards Grid ── */}
      {loading ? <LoadingSpinner /> : (
        filtered.length === 0
          ? <div className="text-center py-5 text-muted"><p>No se encontraron clientes.</p></div>
          : (
            <div className="row g-4">
              {filtered.map(cliente => (
                <div key={cliente.clienteid} className="col-12">
                  <ClienteCard
                    cliente={cliente}
                    onEditCliente={() => openModal('cliente', cliente)}
                    onToggleCliente={handleToggleCliente}
                    onAddProyecto={onAddProyecto}
                    onEditProyecto={onEditProyecto}
                    onToggleProyecto={handleToggleProyecto}
                    onAddTarea={onAddTarea}
                    onEditTarea={onEditTarea}
                    onToggleTarea={handleToggleTarea}
                  />
                </div>
              ))}
            </div>
          )
      )}

      {/* ── Unified Modal ── */}
      <AdminModal isOpen={isModalOpen} onClose={closeModal} title={MODAL_TITLES[modalKey] || ''}>
        {modal && (
          <ClienteProyectoForm
            tipo={modal.tipo}
            initialData={modal.data || {}}
            clientes={clientesConProyectos}
            onSubmit={handleSave}
            onCancel={closeModal}
            saveError={saveError}
          />
        )}
      </AdminModal>
    </div>
  );
}