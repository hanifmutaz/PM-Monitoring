// src/pages/UserManagementPage.jsx
import { useState } from 'react';
import { Plus, Pencil } from 'lucide-react';
import { usePageHeader } from '../contexts/PageHeaderContext';
import { useUsers, useUserMutations } from '../hooks/useUsers';
import Modal from '../components/Modal';
import ToggleSwitch from '../components/ToggleSwitch';

// CATATAN: API spec (03_API_SPECIFICATION.md §11) minta role_id (integer) di
// body POST/PATCH /users, tapi tidak ada endpoint GET /roles untuk
// enumerasi id-nya, dan GET /users cuma balikin nama role (bukan id).
// Karena seed roles di 04_DATABASE_SCHEMA.sql urutannya FIXED
// (INSERT INTO roles (name) VALUES ('Admin'), ('Operator') - SERIAL,
// jadi Admin=1, Operator=2 di database baru manapun yang migration-nya
// dijalankan dari awal), mapping ini di-hardcode di sini. Kalau di masa
// depan ada role tambahan (sesuai catatan "role bisa ditambah nanti"),
// mapping ini WAJIB disesuaikan atau backend perlu nambah endpoint
// GET /roles supaya gak hardcode lagi.
const ROLE_OPTIONS = [
  { id: 1, name: 'Admin' },
  { id: 2, name: 'Operator' },
];

const emptyForm = { username: '', password: '', full_name: '', role_id: '' };

function UserFormModal({ initial, onClose }) {
  const isEdit = !!initial;
  const [form, setForm] = useState(
    isEdit ? { username: initial.username, full_name: initial.full_name, password: '' } : emptyForm
  );
  const [errors, setErrors] = useState({});
  const { create, update } = useUserMutations();
  const pending = create.isPending || update.isPending;

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    try {
      if (isEdit) {
        const payload = { username: form.username, full_name: form.full_name };
        if (form.password) payload.password = form.password;
        await update.mutateAsync({ id: initial.id, payload });
      } else {
        await create.mutateAsync({
          username: form.username,
          password: form.password,
          full_name: form.full_name,
          role_id: Number(form.role_id),
        });
      }
      onClose();
    } catch (err) {
      setErrors(err.response?.data?.errors || { _general: err.response?.data?.message || 'Gagal menyimpan user' });
    }
  }

  return (
    <Modal title={isEdit ? 'Edit User' : 'Tambah User'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <label className="form-label">Username</label>
        <input
          className="form-input"
          style={{ width: '100%', marginBottom: 14 }}
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
        />
        {errors.username && <span style={{ color: 'var(--danger)', fontSize: 11 }}>{errors.username}</span>}

        <label className="form-label">Full Name</label>
        <input
          className="form-input"
          style={{ width: '100%', marginBottom: 14 }}
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          required
        />

        <label className="form-label">{isEdit ? 'Password Baru (kosongkan kalau tidak ganti)' : 'Password'}</label>
        <input
          type="password"
          className="form-input"
          style={{ width: '100%', marginBottom: 14 }}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required={!isEdit}
        />
        {errors.password && <span style={{ color: 'var(--danger)', fontSize: 11 }}>{errors.password}</span>}

        {!isEdit && (
          <>
            <label className="form-label">Role</label>
            <select
              className="form-select"
              style={{ width: '100%', marginBottom: 14 }}
              value={form.role_id}
              onChange={(e) => setForm({ ...form, role_id: e.target.value })}
              required
            >
              <option value="">Pilih Role</option>
              {ROLE_OPTIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </>
        )}

        {errors._general && (
          <div className="error-state" style={{ marginBottom: 12, padding: 8, fontSize: 12 }}>
            {errors._general}
          </div>
        )}

        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? 'Menyimpan...' : 'Simpan'}
        </button>
      </form>
    </Modal>
  );
}

function UserManagementPage() {
  usePageHeader({
    title: 'User Management',
  });

  const { data: users = [], isLoading, isError } = useUsers({});
  const { update } = useUserMutations();
  const [modalState, setModalState] = useState(null);

  return (
    <div className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Daftar User</h2>
        <button type="button" className="btn btn-primary" onClick={() => setModalState({ mode: 'create' })}>
          <Plus size={14} style={{ verticalAlign: -2, marginRight: 4 }} /> Tambah User
        </button>
      </div>

      {isError && <div className="error-state">Gagal memuat daftar user.</div>}
      {isLoading && <div className="empty-state">Memuat data...</div>}

      {!isLoading && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Full Name</th>
              <th>Role</th>
              <th>Status</th>
              <th className="mono">Last Login</th>
              <th style={{ width: 80 }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="mono">{u.username}</td>
                <td>{u.full_name}</td>
                <td>{u.role}</td>
                <td>
                  <ToggleSwitch
                    checked={u.is_active}
                    onChange={(next) => update.mutate({ id: u.id, payload: { is_active: next } })}
                  />
                </td>
                <td className="mono caption">{u.last_login ? new Date(u.last_login).toLocaleString('id-ID') : '-'}</td>
                <td>
                  <button
                    type="button"
                    className="btn-secondary btn"
                    style={{ padding: 6 }}
                    onClick={() => setModalState({ mode: 'edit', user: u })}
                  >
                    <Pencil size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalState && (
        <UserFormModal
          initial={modalState.mode === 'edit' ? modalState.user : null}
          onClose={() => setModalState(null)}
        />
      )}
    </div>
  );
}

export default UserManagementPage;
