import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TrackingRecord, TrackingQuery } from '../types';

export function useTracking() {
  const [trackingRecords, setTrackingRecords] = useState<TrackingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all tracking records (admin view)
  const fetchAllRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('tracking_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setTrackingRecords(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch records');
    } finally {
      setLoading(false);
    }
  };

  // Query tracking records by customer name and phone
  const queryTracking = async ({ customer_name, customer_phone }: TrackingQuery): Promise<TrackingRecord[]> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: queryError } = await supabase
        .from('tracking_records')
        .select('*')
        .ilike('customer_name', `%${customer_name}%`)
        .eq('customer_phone', customer_phone)
        .order('created_at', { ascending: false });

      if (queryError) throw queryError;
      setLoading(false);
      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to query tracking');
      setLoading(false);
      return [];
    }
  };

  // Create a new tracking record
  const createRecord = async (record: Omit<TrackingRecord, 'id' | 'created_at' | 'updated_at'>): Promise<TrackingRecord | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error: createError } = await supabase
        .from('tracking_records')
        .insert([{ ...record, created_by: user?.id }])
        .select()
        .single();

      if (createError) throw createError;
      
      // Refresh the list
      await fetchAllRecords();
      
      setLoading(false);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create record');
      setLoading(false);
      return null;
    }
  };

  // Update a tracking record
  const updateRecord = async (id: string, updates: Partial<TrackingRecord>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from('tracking_records')
        .update(updates)
        .eq('id', id);

      if (updateError) throw updateError;
      
      // Refresh the list
      await fetchAllRecords();
      
      setLoading(false);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update record');
      setLoading(false);
      return false;
    }
  };

  // Delete a tracking record
  const deleteRecord = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('tracking_records')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      
      // Refresh the list
      await fetchAllRecords();
      
      setLoading(false);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete record');
      setLoading(false);
      return false;
    }
  };

  // Generate a tracking number
  const generateTrackingNumber = async (): Promise<string | null> => {
    try {
      const { data, error } = await supabase.rpc('generate_tracking_number');
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate tracking number');
      return null;
    }
  };

  return {
    trackingRecords,
    loading,
    error,
    fetchAllRecords,
    queryTracking,
    createRecord,
    updateRecord,
    deleteRecord,
    generateTrackingNumber,
  };
}


