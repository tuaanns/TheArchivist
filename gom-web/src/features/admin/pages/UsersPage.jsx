import React, { useEffect, useState } from 'react';
import { UserPlus, Edit, Trash2, Shield } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { UserModal } from '../components/UserModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { adminApi } from '../api';
import { formatDate, getErrorMessage } from '../../../lib/utils';
import { Badge } from '../../../components/ui/Badge';

export const UsersPage = ({ notify }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.users();
      const data = res.data?.data || res.data;
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      notify?.(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    setDeleting(true);
    try {
      await adminApi.deleteUser(userToDelete.id);
      notify?.('User deleted successfully', 'success');
      fetchUsers();
      setShowDeleteDialog(false);
      setUserToDelete(null);
    } catch (err) {
      notify?.(getErrorMessage(err), 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    
    try {
      await adminApi.updateUser(user.id, { role: newRole });
      notify?.(`User role updated to ${newRole}`, 'success');
      fetchUsers();
    } catch (err) {
      notify?.(getErrorMessage(err), 'error');
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleAdd = () => {
    setSelectedUser(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const handleSuccess = () => {
    fetchUsers();
  };

  const columns = [
    {
      key: 'id',
      header: 'ID',
      accessor: (row) => row.id,
      cell: (row) => (
        <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
          #{row.id}
        </span>
      ),
      sortable: true,
      searchable: false,
    },
    {
      key: 'name',
      header: 'Name',
      accessor: (row) => row.name,
      cell: (row) => (
        <div className="flex items-center gap-3">
          {row.avatar ? (
            <img
              src={row.avatar}
              alt={row.name}
              className="h-8 w-8 rounded-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className={`h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm ${row.avatar ? 'hidden' : ''}`}>
            {row.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{row.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{row.email}</p>
          </div>
        </div>
      ),
      sortable: true,
      searchable: true,
    },
    {
      key: 'role',
      header: 'Role',
      accessor: (row) => row.role || 'user',
      cell: (row) => (
        <Badge variant={row.role === 'admin' ? 'admin' : 'user'}>
          {row.role || 'user'}
        </Badge>
      ),
      sortable: true,
      searchable: true,
    },
    {
      key: 'token_balance',
      header: 'Credits',
      accessor: (row) => row.token_balance ?? 0,
      cell: (row) => (
        <span className="font-semibold text-gray-900 dark:text-white">
          {row.token_balance ?? 0}
        </span>
      ),
      sortable: true,
      searchable: false,
    },
    {
      key: 'free_used',
      header: 'Free Used',
      accessor: (row) => row.free_used ?? 0,
      cell: (row) => (
        <span className="text-gray-700 dark:text-gray-300">
          {row.free_used ?? 0} / {row.free_limit ?? 5}
        </span>
      ),
      sortable: true,
      searchable: false,
    },
    {
      key: 'created_at',
      header: 'Joined',
      accessor: (row) => row.created_at,
      cell: (row) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {formatDate(row.created_at)}
        </span>
      ),
      sortable: true,
      searchable: false,
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: () => '',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
            title="Edit user"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDeleteClick(row)}
            className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            title="Delete user"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
      sortable: false,
      searchable: false,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-96 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage all users in the system
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <UserPlus size={16} />
          Add User
        </button>
      </div>

      <DataTable
        data={users}
        columns={columns}
        searchPlaceholder="Search by name, email, or role..."
        pageSize={10}
      />

      <UserModal
        isOpen={showModal}
        onClose={handleCloseModal}
        user={selectedUser}
        onSuccess={handleSuccess}
        notify={notify}
      />

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete User"
        message={`Are you sure you want to delete "${userToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};

export default UsersPage;
