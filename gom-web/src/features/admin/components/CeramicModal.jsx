import React, { useState, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import { Modal } from './Modal';
import { FormField, Input, Textarea, Checkbox } from './FormField';
import { adminApi } from '../api';
import { storageApi } from '../../../lib/storageApi';
import { getErrorMessage } from '../../../lib/utils';

export const CeramicModal = ({ isOpen, onClose, ceramic, onSuccess, notify }) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    origin: '',
    country: '',
    era: '',
    style: '',
    description: '',
    image_url: '',
    is_featured: false,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (ceramic) {
      setFormData({
        name: ceramic.name || '',
        origin: ceramic.origin || '',
        country: ceramic.country || '',
        era: ceramic.era || '',
        style: ceramic.style || '',
        description: ceramic.description || '',
        image_url: ceramic.image_url || '',
        is_featured: !!ceramic.is_featured,
      });
      setImagePreview(ceramic.image_url || null);
    } else {
      setFormData({
        name: '',
        origin: '',
        country: '',
        era: '',
        style: '',
        description: '',
        image_url: '',
        is_featured: false,
      });
      setImagePreview(null);
    }
    setImageFile(null);
    setErrors({});
  }, [ceramic, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      notify?.('Please select an image file', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      notify?.('Image size must be less than 5MB', 'error');
      return;
    }

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, image_url: '' }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      let imageUrl = formData.image_url;

      // Upload image if new file selected
      if (imageFile) {
        setUploading(true);
        notify?.('Uploading image...', 'info');
        const uploadResult = await storageApi.uploadSingle(imageFile, 'ceramics');
        imageUrl = uploadResult.fileUrl;
        setUploading(false);
      }

      const submitData = {
        ...formData,
        image_url: imageUrl,
      };

      if (ceramic) {
        await adminApi.updateCeramic(ceramic.id, submitData);
        notify?.('Ceramic line updated successfully', 'success');
      } else {
        await adminApi.createCeramic(submitData);
        notify?.('Ceramic line created successfully', 'success');
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      notify?.(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={ceramic ? 'Edit Ceramic Line' : 'Add New Ceramic Line'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Image Upload */}
        <FormField label="Image">
          <div className="space-y-3">
            {imagePreview ? (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-40 w-40 rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="flex h-40 w-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500">
                <Upload size={32} className="text-gray-400" />
                <span className="mt-2 text-sm text-gray-500">Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </FormField>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Name" required error={errors.name}>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter ceramic line name"
              error={errors.name}
            />
          </FormField>

          <FormField label="Country" required error={errors.country}>
            <Input
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="e.g., Việt Nam, Trung Quốc"
              error={errors.country}
            />
          </FormField>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Origin">
            <Input
              name="origin"
              value={formData.origin}
              onChange={handleChange}
              placeholder="e.g., Hà Nội, Giang Tây"
            />
          </FormField>

          <FormField label="Era">
            <Input
              name="era"
              value={formData.era}
              onChange={handleChange}
              placeholder="e.g., Lý Dynasty, Ming Dynasty"
            />
          </FormField>
        </div>

        <FormField label="Style">
          <Input
            name="style"
            value={formData.style}
            onChange={handleChange}
            placeholder="e.g., Men ngọc, Hoa lam, Celadon"
          />
        </FormField>

        <FormField label="Description">
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter description..."
            rows={4}
          />
        </FormField>

        <FormField>
          <Checkbox
            name="is_featured"
            checked={formData.is_featured}
            onChange={handleChange}
            label="Featured ceramic line"
          />
        </FormField>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || uploading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading
              ? 'Uploading...'
              : loading
                ? 'Saving...'
                : ceramic
                  ? 'Update'
                  : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CeramicModal;
