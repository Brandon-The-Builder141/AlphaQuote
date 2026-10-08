/**
 * Reusable Form Field Component
 * Works seamlessly with react-hook-form
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FormField({
  label,
  name,
  type = 'text',
  register,
  error,
  icon: Icon,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  rows,
  options, // For select inputs
  helperText,
  ...props
}) {
  const inputClasses = `w-full bg-slate-800/50 border ${
    error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-700/50 focus:border-primary focus:ring-primary/20'
  } rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 transition-all duration-200 font-body disabled:opacity-50 disabled:cursor-not-allowed ${className}`;

  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <textarea
          {...register(name)}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows || 4}
          className={`${inputClasses} resize-none`}
          {...props}
        />
      );
    }

    if (type === 'select') {
      return (
        <select
          {...register(name)}
          disabled={disabled}
          className={inputClasses}
          {...props}
        >
          <option value="">Select {label.toLowerCase()}</option>
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        {...register(name)}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className={inputClasses}
        {...props}
      />
    );
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-slate-300 font-body flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-primary" />}
          {label}
          {required && <span className="text-red-400">*</span>}
        </label>
      )}

      {/* Input Field */}
      {renderInput()}

      {/* Error Message */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-red-400 text-sm font-body flex items-center gap-1"
          >
            <span className="text-lg">⚠️</span>
            {error.message}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Helper Text */}
      {helperText && !error && (
        <p className="text-slate-500 text-sm font-body">{helperText}</p>
      )}
    </div>
  );
}

