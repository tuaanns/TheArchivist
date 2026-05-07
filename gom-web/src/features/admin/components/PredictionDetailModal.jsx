import React from 'react';
import { Modal } from './Modal';
import { PredictionDetailView } from '../../../components/ui/PredictionDetailView';

export const PredictionDetailModal = ({ isOpen, onClose, prediction }) => {
  if (!prediction) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Prediction Details"
      size="xl"
    >
      <PredictionDetailView prediction={prediction} showUserInfo={true} showDebugInfo={true} />
    </Modal>
  );
};

export default PredictionDetailModal;
