import { useState, useEffect } from 'react';
import { Package, Upload, Search, Edit2, Trash2, X, Check, Loader } from 'lucide-react';
import { useTracking } from '../hooks/useTracking';
import { useOCR } from '../hooks/useOCR';
import { useImageUpload } from '../hooks/useImageUpload';
import { TrackingRecord, ExtractedData } from '../types';

export default function TrackingAdmin() {
  const { trackingRecords, loading, error, fetchAllRecords, createRecord, updateRecord, deleteRecord } = useTracking();
  const { isProcessing: isOCRProcessing, progress, processImage } = useOCR();
  const { uploadImage, uploading } = useImageUpload();
  
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TrackingRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form states
  const [formData, setFormData] = useState({
    tracking_number: '',
    customer_name: '',
    customer_phone: '',
    status: 'pending' as TrackingRecord['status'],
    notes: '',
    image_url: '',
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchAllRecords();
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));

    // Process image with OCR
    try {
      const data = await processImage(file);
      setExtractedData(data);
      
      // Auto-fill form with extracted data
      setFormData(prev => ({
        ...prev,
        tracking_number: data.tracking_number || prev.tracking_number,
        customer_name: data.customer_name || prev.customer_name,
        customer_phone: data.customer_phone || prev.customer_phone,
      }));
    } catch (err) {
      console.error('OCR processing failed:', err);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let imageUrl = formData.image_url;

    // Upload image if selected
    if (selectedFile) {
      imageUrl = await uploadImage(selectedFile, 'tracking-images');
      if (!imageUrl) {
        alert('Failed to upload image');
        return;
      }
    }

    const recordData = {
      ...formData,
      image_url: imageUrl,
      extracted_data: extractedData,
    };

    if (editingRecord) {
      const success = await updateRecord(editingRecord.id, recordData);
      if (success) {
        alert('Record updated successfully!');
        resetForm();
      }
    } else {
      const created = await createRecord(recordData);
      if (created) {
        alert('Tracking record created successfully!');
        resetForm();
      }
    }
  };

  const resetForm = () => {
    setFormData({
      tracking_number: '',
      customer_name: '',
      customer_phone: '',
      status: 'pending',
      notes: '',
      image_url: '',
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setExtractedData(null);
    setEditingRecord(null);
    setShowForm(false);
  };

  const handleEdit = (record: TrackingRecord) => {
    setEditingRecord(record);
    setFormData({
      tracking_number: record.tracking_number,
      customer_name: record.customer_name,
      customer_phone: record.customer_phone,
      status: record.status,
      notes: record.notes || '',
      image_url: record.image_url || '',
    });
    setShowForm(true);
    setPreviewUrl(record.image_url || null);
    setExtractedData(record.extracted_data || null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this tracking record?')) {
      await deleteRecord(id);
    }
  };

  const filteredRecords = trackingRecords.filter(record =>
    record.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.customer_phone.includes(searchTerm)
  );

  const statusColors = {
    pending: 'bg-gray-100 text-gray-800',
    processing: 'bg-blue-100 text-blue-800',
    in_transit: 'bg-yellow-100 text-yellow-800',
    out_for_delivery: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Tracking System Admin</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Upload className="w-5 h-5" />
            {showForm ? 'Cancel' : 'Add New Record'}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6">
              {editingRecord ? 'Edit Tracking Record' : 'Add New Tracking Record'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Receipt/Label Image
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {(isOCRProcessing || uploading) && (
                    <div className="flex items-center gap-2">
                      <Loader className="w-5 h-5 animate-spin text-blue-600" />
                      <span className="text-sm text-gray-600">
                        {isOCRProcessing ? `Processing... ${progress}%` : 'Uploading...'}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Image Preview */}
                {previewUrl && (
                  <div className="mt-4">
                    <img src={previewUrl} alt="Preview" className="max-w-md rounded-lg border" />
                  </div>
                )}

                {/* Extracted Data Display */}
                {extractedData && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-sm text-gray-700 mb-2">Extracted Data:</h3>
                    <div className="space-y-2 text-sm">
                      {extractedData.tracking_number && (
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">✓</span>
                          <span className="font-medium">Tracking:</span>
                          <span className="font-mono bg-white px-2 py-1 rounded border">
                            {extractedData.tracking_number}
                          </span>
                        </div>
                      )}
                      {extractedData.customer_name && (
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">✓</span>
                          <span className="font-medium">Name:</span>
                          <span className="font-mono bg-white px-2 py-1 rounded border">
                            {extractedData.customer_name}
                          </span>
                        </div>
                      )}
                      {extractedData.customer_phone && (
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">✓</span>
                          <span className="font-medium">Phone:</span>
                          <span className="font-mono bg-white px-2 py-1 rounded border">
                            {extractedData.customer_phone}
                          </span>
                        </div>
                      )}
                      {(!extractedData.tracking_number && !extractedData.customer_name && !extractedData.customer_phone) && (
                        <div className="text-amber-600 text-sm">
                          ⚠️ No clear data extracted. Please check the image quality or enter manually.
                        </div>
                      )}
                    </div>
                    <details className="mt-3">
                      <summary className="text-xs text-gray-500 cursor-pointer">View raw extracted text</summary>
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap mt-2 bg-white p-2 rounded border">
                        {extractedData.raw_text}
                      </pre>
                    </details>
                  </div>
                )}
              </div>

              {/* Tracking Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tracking Number * {extractedData?.tracking_number && (
                    <span className="text-green-600 text-xs">(Auto-extracted from image)</span>
                  )}
                </label>
                <input
                  type="text"
                  required
                  value={formData.tracking_number}
                  onChange={(e) => setFormData({ ...formData, tracking_number: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Upload an image to extract tracking number"
                />
                {!extractedData?.tracking_number && formData.tracking_number === '' && (
                  <p className="mt-1 text-sm text-gray-500">
                    📷 Upload an image with a visible tracking number, or enter manually
                  </p>
                )}
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name * {extractedData?.customer_name && (
                    <span className="text-green-600 text-xs">(Auto-extracted from image)</span>
                  )}
                </label>
                <input
                  type="text"
                  required
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Upload image to extract name, or enter manually"
                />
                {!extractedData?.customer_name && formData.customer_name === '' && (
                  <p className="mt-1 text-sm text-gray-500">
                    📷 OCR will extract from labels like "Name:", "Customer:", "Consignee:", "To:", "Recipient:"
                  </p>
                )}
              </div>

              {/* Customer Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Phone * {extractedData?.customer_phone && (
                    <span className="text-green-600 text-xs">(Auto-extracted from image)</span>
                  )}
                </label>
                <input
                  type="tel"
                  required
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Upload image to extract phone, or enter manually"
                />
                {!extractedData?.customer_phone && formData.customer_phone === '' && (
                  <p className="mt-1 text-sm text-gray-500">
                    📷 OCR will extract Philippine mobile (09XX) or international format (+639XX)
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as TrackingRecord['status'] })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="in_transit">In Transit</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Additional notes or instructions..."
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading || uploading || isOCRProcessing}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  {editingRecord ? 'Update Record' : 'Create Record'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by tracking number, customer name, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No tracking records found. Add one to get started!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tracking Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {record.tracking_number}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{record.customer_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{record.customer_phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[record.status]}`}>
                          {record.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(record.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(record)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <Edit2 className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

