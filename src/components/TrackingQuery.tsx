import { useState } from 'react';
import { Search, Package, MapPin, Calendar, FileText, Loader } from 'lucide-react';
import { useTracking } from '../hooks/useTracking';
import { TrackingRecord } from '../types';

export default function TrackingQuery() {
  const { queryTracking, loading } = useTracking();
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [results, setResults] = useState<TrackingRecord[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    
    const records = await queryTracking({
      customer_name: customerName,
      customer_phone: customerPhone,
    });
    
    setResults(records);
  };

  const statusConfig = {
    pending: { color: 'bg-gray-500', icon: '⏳', label: 'Pending' },
    processing: { color: 'bg-blue-500', icon: '🔄', label: 'Processing' },
    in_transit: { color: 'bg-yellow-500', icon: '🚚', label: 'In Transit' },
    out_for_delivery: { color: 'bg-purple-500', icon: '📦', label: 'Out for Delivery' },
    delivered: { color: 'bg-green-500', icon: '✅', label: 'Delivered' },
    cancelled: { color: 'bg-red-500', icon: '❌', label: 'Cancelled' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Package className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Track Your Shipment</h1>
          <p className="text-xl text-blue-100">
            Enter your name and phone number to find your tracking information
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-8">
        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Full Name
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                placeholder="e.g., Juan Dela Cruz"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                placeholder="e.g., 09171234567"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Track Shipment
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Section */}
        {searched && (
          <div className="space-y-6 pb-12">
            {results.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  No Tracking Records Found
                </h3>
                <p className="text-gray-600">
                  We couldn't find any shipments matching your name and phone number.
                  <br />
                  Please double-check your information and try again.
                </p>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Found {results.length} shipment{results.length > 1 ? 's' : ''}
                  </h2>
                </div>

                {results.map((record) => (
                  <div
                    key={record.id}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition"
                  >
                    {/* Status Header */}
                    <div className={`${statusConfig[record.status].color} text-white p-6`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm opacity-90 mb-1">Tracking Number</div>
                          <div className="text-3xl font-bold">
                            {record.tracking_number}
                          </div>
                        </div>
                        <div className="text-6xl">
                          {statusConfig[record.status].icon}
                        </div>
                      </div>
                      <div className="mt-4 text-lg font-semibold">
                        Status: {statusConfig[record.status].label}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-6 space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                          <Package className="w-5 h-5 text-gray-400 mt-1" />
                          <div>
                            <div className="text-sm text-gray-500">Customer Name</div>
                            <div className="font-semibold text-gray-900">
                              {record.customer_name}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                          <div>
                            <div className="text-sm text-gray-500">Contact Number</div>
                            <div className="font-semibold text-gray-900">
                              {record.customer_phone}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                          <div>
                            <div className="text-sm text-gray-500">Created Date</div>
                            <div className="font-semibold text-gray-900">
                              {new Date(record.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                          <div>
                            <div className="text-sm text-gray-500">Last Updated</div>
                            <div className="font-semibold text-gray-900">
                              {new Date(record.updated_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      {record.notes && (
                        <div className="flex items-start gap-3 pt-4 border-t">
                          <FileText className="w-5 h-5 text-gray-400 mt-1" />
                          <div className="flex-1">
                            <div className="text-sm text-gray-500 mb-1">Additional Notes</div>
                            <div className="text-gray-900 whitespace-pre-wrap">
                              {record.notes}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Image */}
                      {record.image_url && (
                        <div className="pt-4 border-t">
                          <div className="text-sm text-gray-500 mb-2">Receipt/Label Image</div>
                          <img
                            src={record.image_url}
                            alt="Receipt"
                            className="w-full max-w-md rounded-lg border"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


