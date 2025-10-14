"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Check, AlertCircle, Info, TrendingUp } from 'lucide-react';
import formSchema from '@/lib/form';
// Types
interface Field {
  id: string;
  label: string;
  type: string;
  options?: string[];
}

interface Row {
  id: string;
  category?: string;
  activity: string;
  description?: string;
  unit?: string;
  grading_criteria?: {
    good: string;
    satisfactory: string;
    not_satisfactory: string;
  };
  applicable_to?: string;
  fields: Field[];
  subactivities?: string[];
}

interface Table {
  id: string;
  title: string;
  type: string;
  grading_criteria?: {
    good: string;
    satisfactory: string;
    not_satisfactory: string;
  };
  applicable_to?: string;
  rows: Row[];
  overall_grading?: {
    good: string;
    satisfactory: string;
    not_satisfactory: string;
  };
  note?: string;
}

interface FormData {
  [key: string]: any;
}
const formMeta = formSchema.sections?.[1];
// Mock JSON - Replace with: import formJson from '@/lib/form.json'
const partBData = formSchema.sections?.[1]?.subsections?.[0] ?? null;

const STORAGE_KEY = 'pbas_form_part_b_table1';

export default function PartBTable1Form() {
  const [formData, setFormData] = useState<FormData>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        setFormData(JSON.parse(savedData));
      } catch (e) {
        console.error('Error loading saved data:', e);
      }
    }
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      const timeoutId = setTimeout(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
        setSaveStatus('saving');
        setTimeout(() => setSaveStatus('saved'), 500);
        setTimeout(() => setSaveStatus('idle'), 2000);
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [formData]);

  const handleFieldChange = (tableId: string, rowId: string, fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [tableId]: {
        ...prev[tableId],
        [rowId]: {
          ...prev[tableId]?.[rowId],
          [fieldId]: value
        }
      }
    }));

    // Clear error
    const errorKey = `${tableId}.${rowId}.${fieldId}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const toggleRowExpansion = (rowId: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [rowId]: !prev[rowId]
    }));
  };

  const getGradingColor = (grading: string) => {
    switch (grading?.toLowerCase()) {
      case 'good':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'satisfactory':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'not satisfactory':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const renderField = (table: Table, row: Row, field: Field) => {
    const value = formData[table.id]?.[row.id]?.[field.id] || '';
    const fieldKey = `${table.id}.${row.id}.${field.id}`;
    const error = errors[fieldKey];

    if (field.type === 'select') {
      return (
        <div key={field.id} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {field.label}
          </label>
          <select
            value={value}
            onChange={(e) => handleFieldChange(table.id, row.id, field.id, e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              value ? getGradingColor(value) : 'border-gray-300'
            }`}
          >
            <option value="">Select...</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm flex items-center gap-1"
            >
              <AlertCircle size={14} /> {error}
            </motion.p>
          )}
        </div>
      );
    }

    return (
      <div key={field.id} className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {field.label}
        </label>
        <input
          type={field.type}
          value={value}
          onChange={(e) => {
            const val = field.type === 'number' ? parseFloat(e.target.value) || '' : e.target.value;
            handleFieldChange(table.id, row.id, field.id, val);
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm flex items-center gap-1"
          >
            <AlertCircle size={14} /> {error}
          </motion.p>
        )}
      </div>
    );
  };

  const renderActivityRow = (table: Table, row: Row, index: number) => {
    const isExpanded = expandedRows[row.id];

    return (
      <motion.div
        key={row.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 * index }}
        className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
      >
        {/* Activity Header */}
        <div
          className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 cursor-pointer hover:bg-blue-100 transition-colors"
          onClick={() => toggleRowExpansion(row.id)}
        >
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-2">{row.activity}</h4>
              {row.description && (
                <p className="text-sm text-gray-600 italic">{row.description}</p>
              )}
              {row.subactivities && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-700 mb-2">Includes:</p>
                  <div className="flex flex-wrap gap-2">
                    {row.subactivities.slice(0, 3).map((sub, idx) => (
                      <span key={idx} className="text-xs bg-white px-2 py-1 rounded border border-gray-200">
                        {sub}
                      </span>
                    ))}
                    {row.subactivities.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{row.subactivities.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="text-gray-400"
            >
              ▼
            </motion.div>
          </div>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-6 bg-gray-50 border-t border-gray-200">
                {row.subactivities && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-900 mb-2">All Sub-activities:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {row.subactivities.map((sub, idx) => (
                        <div key={idx} className="text-sm text-blue-800 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                          {sub}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {row.fields.map((field) => renderField(table, row, field))}
                </div>

                {row.grading_criteria && (
                  <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
                    <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <TrendingUp size={16} />
                      Grading Criteria
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="p-3 bg-green-50 rounded border border-green-200">
                        <p className="text-xs font-medium text-green-900">Good</p>
                        <p className="text-sm text-green-700">{row.grading_criteria.good}</p>
                      </div>
                      <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                        <p className="text-xs font-medium text-yellow-900">Satisfactory</p>
                        <p className="text-sm text-yellow-700">{row.grading_criteria.satisfactory}</p>
                      </div>
                      <div className="p-3 bg-red-50 rounded border border-red-200">
                        <p className="text-xs font-medium text-red-900">Not Satisfactory</p>
                        <p className="text-sm text-red-700">{row.grading_criteria.not_satisfactory}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                PART B: ACADEMIC PERFORMANCE INDICATORS (API)
              </h1>
              <p className="text-gray-600 mb-4">{partBData.title}</p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-sm text-gray-700">{partBData.description}</p>
              </div>
            </div>
          </div>

          {/* Save Status */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: saveStatus !== 'idle' ? 1 : 0 }}
            className="mt-4 flex items-center gap-2 text-sm"
          >
            {saveStatus === 'saving' && (
              <span className="text-blue-600 flex items-center gap-2">
                <Save size={16} className="animate-pulse" /> Saving...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="text-green-600 flex items-center gap-2">
                <Check size={16} /> Saved to browser
              </span>
            )}
          </motion.div>
        </div>

        {/* Tables */}
        {partBData.tables.map((table: Table, tableIndex: number) => (
          <motion.div
            key={table.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (tableIndex + 1) }}
            className="mb-8"
          >
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{table.title}</h2>
                {table.grading_criteria && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Info size={16} />
                      Grading Criteria ({table.applicable_to})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="p-3 bg-green-50 rounded border border-green-200">
                        <p className="text-xs font-medium text-green-900">Good</p>
                        <p className="text-sm text-green-700">{table.grading_criteria.good}</p>
                      </div>
                      <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                        <p className="text-xs font-medium text-yellow-900">Satisfactory</p>
                        <p className="text-sm text-yellow-700">{table.grading_criteria.satisfactory}</p>
                      </div>
                      <div className="p-3 bg-red-50 rounded border border-red-200">
                        <p className="text-xs font-medium text-red-900">Not Satisfactory</p>
                        <p className="text-sm text-red-700">{table.grading_criteria.not_satisfactory}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Activity Rows */}
              <div className="space-y-4">
                {table.rows.map((row, rowIndex) => renderActivityRow(table, row, rowIndex))}
              </div>

              {/* Overall Grading */}
              {table.overall_grading && (
                <div className="mt-6 p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Overall Grading Summary</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">Good</span>
                      <p className="text-sm text-gray-700">{table.overall_grading.good}</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm font-medium">Satisfactory</span>
                      <p className="text-sm text-gray-700">{table.overall_grading.satisfactory}</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm font-medium">Not Satisfactory</span>
                      <p className="text-sm text-gray-700">{table.overall_grading.not_satisfactory}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Note */}
              {table.note && (
                <div className="mt-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    <strong>Note:</strong> {table.note}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex gap-4 justify-end"
        >
          <button
            onClick={() => {
              localStorage.removeItem(STORAGE_KEY);
              setFormData({});
              setExpandedRows({});
            }}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear Form
          </button>
          <button
            onClick={() => {
              console.log('Form Data:', formData);
              alert('Form validated! Check console for data.');
            }}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2"
          >
            <Check size={20} /> Save & Continue
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}