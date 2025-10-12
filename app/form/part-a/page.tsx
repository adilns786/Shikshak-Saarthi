
"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Plus, Trash2, Check, AlertCircle } from 'lucide-react';
import formschema from '@/lib/form.js';
// Types
interface Field {
  id: string;
  label: string;
  type: string;
  required?: boolean;
  validation?: string;
  step?: number;
  options?: string[];
}

interface Column extends Field {}

interface Subsection {
  id: string;
  title: string;
  type?: string;
  fields?: Field[];
  columns?: Column[];
  allowMultiple?: boolean;
  note?: string;
}

interface FormData {
  [key: string]: any;
}
 const formJson = formschema;

const STORAGE_KEY = 'pbas_form_part_a';

export default function PartAForm() {
  const [formData, setFormData] = useState<FormData>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const formRef = useRef<HTMLDivElement>(null);

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

  const handleInputChange = (subsectionId: string, fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [subsectionId]: {
        ...prev[subsectionId],
        [fieldId]: value
      }
    }));
    
    // Clear error for this field
    if (errors[`${subsectionId}.${fieldId}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${subsectionId}.${fieldId}`];
        return newErrors;
      });
    }
  };

  const handleTableRowChange = (subsectionId: string, rowIndex: number, columnId: string, value: any) => {
    setFormData(prev => {
      const currentRows = prev[subsectionId] || [];
      const newRows = [...currentRows];
      if (!newRows[rowIndex]) {
        newRows[rowIndex] = {};
      }
      newRows[rowIndex][columnId] = value;
      return {
        ...prev,
        [subsectionId]: newRows
      };
    });
  };

  const addTableRow = (subsectionId: string) => {
    setFormData(prev => ({
      ...prev,
      [subsectionId]: [...(prev[subsectionId] || []), {}]
    }));
  };

  const removeTableRow = (subsectionId: string, rowIndex: number) => {
    setFormData(prev => ({
      ...prev,
      [subsectionId]: (prev[subsectionId] || []).filter((_: any, i: number) => i !== rowIndex)
    }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    formJson.sections[0].subsections.forEach((subsection: Subsection) => {
      if (subsection.fields) {
        subsection.fields.forEach((field: Field) => {
          if (field.required) {
            const value = formData[subsection.id]?.[field.id];
            if (!value) {
              newErrors[`${subsection.id}.${field.id}`] = 'This field is required';
            }
          }
        });
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const renderField = (subsection: Subsection, field: Field) => {
    const fieldKey = `${subsection.id}.${field.id}`;
    const value = formData[subsection.id]?.[field.id] || '';
    const error = errors[fieldKey];

    const baseClasses = `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
      error ? 'border-red-500' : 'border-gray-300'
    }`;

    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={value}
              onChange={(e) => handleInputChange(subsection.id, field.id, e.target.value)}
              className={`${baseClasses} min-h-[100px]`}
              rows={4}
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

      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => handleInputChange(subsection.id, field.id, e.target.value)}
              className={baseClasses}
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

      default:
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type={field.type}
              value={value}
              onChange={(e) => {
                const val = field.type === 'number' ? parseFloat(e.target.value) || '' : e.target.value;
                handleInputChange(subsection.id, field.id, field.validation === 'uppercase' ? val.toString().toUpperCase() : val);
              }}
              step={field.step}
              className={baseClasses}
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
    }
  };

  const renderTable = (subsection: Subsection) => {
    const rows = formData[subsection.id] || [{}];

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-semibold text-gray-800">{subsection.title}</h4>
          <button
            onClick={() => addTableRow(subsection.id)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} /> Add Row
          </button>
        </div>
        {subsection.note && (
          <p className="text-sm text-gray-600 italic">{subsection.note}</p>
        )}
        
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {subsection.columns?.map((col) => (
                  <th key={col.id} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {col.label} {col.required && <span className="text-red-500">*</span>}
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <AnimatePresence>
                {rows.map((row: any, rowIndex: number) => (
                  <motion.tr
                    key={rowIndex}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {subsection.columns?.map((col) => (
                      <td key={col.id} className="px-4 py-3">
                        {col.type === 'select' ? (
                          <select
                            value={row[col.id] || ''}
                            onChange={(e) => handleTableRowChange(subsection.id, rowIndex, col.id, e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select...</option>
                            {col.options?.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={col.type}
                            value={row[col.id] || ''}
                            onChange={(e) => {
                              const val = col.type === 'number' ? parseFloat(e.target.value) || '' : e.target.value;
                              handleTableRowChange(subsection.id, rowIndex, col.id, val);
                            }}
                            step={col.step}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => removeTableRow(subsection.id, rowIndex)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Self-Assessment-Cum-Performance Appraisal Forms API-PBAS Proforma
          </h1>
          <p className="text-gray-600">Part A: General Information and Academic Background</p>
          
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

        {/* Form Header Fields */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Form Header</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {formJson.formHeader.fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                <input
                  type={field.type}
                  value={formData.header?.[field.id] || ''}
                  onChange={(e) => handleInputChange('header', field.id, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Main Form */}
        <div ref={formRef} className="space-y-6">
          {formJson.sections[0].subsections.map((subsection: Subsection, index: number) => (
            <motion.div
              key={subsection.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              {subsection.type === 'table' ? (
                renderTable(subsection)
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">{subsection.title}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {subsection.fields?.map((field) => renderField(subsection, field))}
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex gap-4 justify-end"
        >
          <button
            onClick={() => {
              localStorage.removeItem(STORAGE_KEY);
              setFormData({});
            }}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear Form
          </button>
          <button
            onClick={validateForm}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Check size={20} /> Validate & Continue
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}