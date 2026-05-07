import React, { useEffect, useState } from 'react';
import { Download, Eye } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { PredictionDetailModal } from '../components/PredictionDetailModal';
import { ImageWithFallback } from '../../../components/ui/ImageWithFallback';
import { adminApi } from '../api';
import { formatDate, getErrorMessage } from '../../../lib/utils';

export const PredictionsPage = ({ notify }) => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      const res = await adminApi.predictions();
      const data = res.data?.data || res.data;
      setPredictions(Array.isArray(data) ? data : []);
    } catch (err) {
      notify?.(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (prediction) => {
    // Show modal immediately with light data, then enrich with full AI result.
    setSelectedPrediction(prediction);
    setShowModal(true);
    try {
      const res = await adminApi.getPrediction(prediction.id);
      const full = res.data?.data || res.data;
      if (full && (full.id === prediction.id || !full.id)) {
        setSelectedPrediction((prev) => ({ ...prev, ...full }));
      }
    } catch (err) {
      // Silent: modal still works with list-level data.
      // eslint-disable-next-line no-console
      console.warn('[admin] getPrediction failed', err);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPrediction(null);
  };

  const handleExport = () => {
    // Convert predictions to CSV
    const headers = ['ID', 'Label', 'Confidence', 'User', 'Date'];
    const csvContent = [
      headers.join(','),
      ...predictions.map(p => [
        p.id,
        `"${p.predicted_label || p.label || ''}"`,
        Math.round((p.confidence || p.certainty || 0) * 100),
        `"${p.user?.name || 'Unknown'}"`,
        formatDate(p.created_at)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `predictions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    notify?.('Predictions exported successfully', 'success');
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
      key: 'image',
      header: 'Image',
      accessor: () => '',
      cell: (row) => {
        const imgSrc =
          row.image_url || row.image || (row.image_path ? `/storage/${row.image_path}` : null);
        return (
          <ImageWithFallback
            src={imgSrc}
            alt={row.predicted_label || row.label || 'Prediction'}
            className="h-12 w-12 rounded-lg"
          />
        );
      },
      sortable: false,
      searchable: false,
    },
    {
      key: 'label',
      header: 'Predicted Label',
      accessor: (row) => row.predicted_label || row.label,
      cell: (row) => (
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">
            {row.predicted_label || row.label || '—'}
          </p>
          {row.era && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{row.era}</p>
          )}
        </div>
      ),
      sortable: true,
      searchable: true,
    },
    {
      key: 'confidence',
      header: 'Confidence',
      accessor: (row) => row.confidence || row.certainty || 0,
      cell: (row) => {
        const confidence = Math.round((row.confidence || row.certainty || 0) * 100);
        const color = confidence >= 80 ? 'text-green-600' : confidence >= 60 ? 'text-yellow-600' : 'text-red-600';
        return (
          <div className="flex items-center gap-2">
            <div className="h-2 w-20 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className={`h-full ${confidence >= 80 ? 'bg-green-600' : confidence >= 60 ? 'bg-yellow-600' : 'bg-red-600'}`}
                style={{ width: `${confidence}%` }}
              />
            </div>
            <span className={`text-sm font-semibold ${color}`}>
              {confidence}%
            </span>
          </div>
        );
      },
      sortable: true,
      searchable: false,
    },
    {
      key: 'user',
      header: 'User',
      accessor: (row) => row.user?.name || row.user_id,
      cell: (row) => (
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {row.user?.name || 'Unknown'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {row.user?.email || `ID: ${row.user_id}`}
          </p>
        </div>
      ),
      sortable: true,
      searchable: true,
    },
    {
      key: 'created_at',
      header: 'Date',
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
        <button
          onClick={() => handleViewDetails(row)}
          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
          title="View details"
        >
          <Eye size={16} />
        </button>
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Predictions</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            View all AI predictions and analysis results
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      <DataTable
        data={predictions}
        columns={columns}
        searchPlaceholder="Search by label or user..."
        pageSize={10}
      />

      <PredictionDetailModal
        isOpen={showModal}
        onClose={handleCloseModal}
        prediction={selectedPrediction}
      />
    </div>
  );
};

export default PredictionsPage;
