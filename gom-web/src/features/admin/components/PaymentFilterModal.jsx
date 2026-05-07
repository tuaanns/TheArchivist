import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { FormField, Input, Select } from './FormField';

export const PaymentFilterModal = ({ isOpen, onClose, onApply, currentFilters }) => {
  const [filters, setFilters] = useState({
    status: '',
    method: '',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: '',
  });

  useEffect(() => {
    if (currentFilters) {
      setFilters(currentFilters);
    }
  }, [currentFilters, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      status: '',
      method: '',
      dateFrom: '',
      dateTo: '',
      minAmount: '',
      maxAmount: '',
    };
    setFilters(resetFilters);
    onApply(resetFilters);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Filter Payments"
      size="md"
    >
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Status">
            <Select name="status" value={filters.status} onChange={handleChange}>
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </Select>
          </FormField>

          <FormField label="Payment Method">
            <Select name="method" value={filters.method} onChange={handleChange}>
              <option value="">All Methods</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="credit_card">Credit Card</option>
              <option value="e_wallet">E-Wallet</option>
            </Select>
          </FormField>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Date From">
            <Input
              type="date"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleChange}
            />
          </FormField>

          <FormField label="Date To">
            <Input
              type="date"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleChange}
            />
          </FormField>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Min Amount (VND)">
            <Input
              type="number"
              name="minAmount"
              value={filters.minAmount}
              onChange={handleChange}
              placeholder="0"
              min="0"
            />
          </FormField>

          <FormField label="Max Amount (VND)">
            <Input
              type="number"
              name="maxAmount"
              value={filters.maxAmount}
              onChange={handleChange}
              placeholder="1000000"
              min="0"
            />
          </FormField>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentFilterModal;