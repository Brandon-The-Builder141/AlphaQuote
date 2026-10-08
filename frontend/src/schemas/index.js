/**
 * Centralized Validation Schemas
 * All form validation schemas using Zod
 *
 * Import schemas from here to ensure consistency across the application
 */

import { z } from 'zod';

// ============================================
// Common Validation Patterns
// ============================================

const emailValidation = z.string().email('Invalid email address').optional().or(z.literal(''));
const phoneValidation = z.string().regex(/^\+?[\d\s()-]{0,20}$/, 'Invalid phone number').optional().or(z.literal(''));
const positiveNumber = z.number().min(0, 'Must be a positive number');
const positiveNumberString = z.string().refine(
  (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
  'Must be a positive number'
);
const requiredString = z.string().min(1, 'This field is required');

// ============================================
// Estimate / Quote Schemas
// ============================================

export const clientInfoSchema = z.object({
  clientName: requiredString,
  jobType: requiredString,
  email: emailValidation,
  phone: phoneValidation,
  address: z.string().optional()
});

export const roomSchema = z.object({
  name: requiredString,
  sqft: z.number().min(1, 'Square footage must be at least 1'),
  materialCost: z.number().min(0, 'Material cost must be positive'),
  laborHours: z.number().min(0, 'Labor hours must be positive'),
  laborRate: z.number().min(0, 'Labor rate must be positive').default(75),
  demo: z.boolean().default(false),
  trim: z.boolean().default(false),
  paint: z.boolean().default(false),
  notes: z.string().optional()
});

export const taskSchema = z.object({
  name: requiredString,
  description: z.string().optional(),
  materialCost: z.number().min(0, 'Material cost must be positive'),
  laborCost: z.number().min(0, 'Labor cost must be positive'),
  disposal: z.boolean().default(false),
  delivery: z.boolean().default(false),
  notes: z.string().optional()
});

export const estimateSchema = z.object({
  clientInfo: clientInfoSchema,
  rooms: z.array(roomSchema).min(1, 'At least one room is required'),
  markup: z.number().min(0).max(100, 'Markup must be between 0 and 100').default(15),
  taxEnabled: z.boolean().default(false),
  taxRate: z.number().min(0).max(100, 'Tax rate must be between 0 and 100').default(0),
  discount: z.number().min(0).default(0),
  notes: z.string().optional()
});

// ============================================
// Vendor Schemas
// ============================================

export const vendorSchema = z.object({
  name: z.string().min(1, 'Vendor name is required').max(100, 'Name is too long'),
  contactInfo: z.string().max(200, 'Contact info is too long').optional(),
  notes: z.string().max(1000, 'Notes are too long').optional()
});

// ============================================
// Receipt Schemas
// ============================================

export const receiptSchema = z.object({
  vendorName: z.string().min(1, 'Vendor name is required'),
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  totalAmount: positiveNumberString.refine(
    (val) => parseFloat(val) > 0,
    'Total amount must be greater than 0'
  ),
  notes: z.string().max(1000, 'Notes are too long').optional(),
  receiptFile: z.any().optional()
});

export const receiptEditSchema = z.object({
  vendorName: z.string().min(1, 'Vendor name is required'),
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  totalAmount: positiveNumberString.refine(
    (val) => parseFloat(val) > 0,
    'Total amount must be greater than 0'
  ),
  notes: z.string().optional(),
  status: z.enum(['parsed', 'manual', 'verified']).default('parsed'),
  projectId: z.string().optional()
});

export const receiptItemSchema = z.object({
  name: requiredString,
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  unitPrice: z.number().min(0, 'Price must be positive'),
  category: z.string().optional()
});

// ============================================
// Profile / Settings Schemas
// ============================================

export const profileSchema = z.object({
  businessName: z.string().min(1, 'Business name is required').max(100),
  email: emailValidation,
  phone: phoneValidation,
  address: z.string().max(200).optional(),
  website: z.string().url('Invalid URL').or(z.literal('')).optional(),
  license: z.string().max(50).optional(),
  defaultMarkup: z.number().min(0).max(100).default(15),
  hourlyLaborRate: z.number().min(0).max(500).default(75),
  serviceZipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code').optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional()
});

export const businessProfileSchema = z.object({
  companyName: requiredString,
  email: z.string().email('Invalid email address'),
  phone: phoneValidation,
  address: z.string().optional(),
  website: z.string().url('Invalid URL').or(z.literal('')).optional(),
  license: z.string().optional()
});

// ============================================
// Follow-up Schemas
// ============================================

export const followUpSchema = z.object({
  clientEmail: z.string().email('Invalid email address'),
  clientName: z.string().min(1, 'Client name is required'),
  subject: z.string().min(1, 'Subject is required').max(200),
  message: z.string().min(1, 'Message is required').max(5000),
  scheduledDate: z.string().min(1, 'Scheduled date is required'),
  templateId: z.string().optional()
});

export const followUpTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(100),
  subject: z.string().min(1, 'Subject is required').max(200),
  message: z.string().min(1, 'Message is required').max(5000),
  isDefault: z.boolean().default(false)
});

// ============================================
// Task Template Schemas
// ============================================

export const taskTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(100),
  description: z.string().max(500).optional(),
  category: z.string().max(50).optional(),
  tasks: z.array(z.object({
    name: requiredString,
    description: z.string().optional(),
    category: z.string().optional(),
    unit: z.string().optional(),
    quantity: z.number().min(0).default(1),
    unitPrice: z.number().min(0).default(0),
    totalPrice: z.number().min(0).default(0)
  })).min(1, 'At least one task is required')
});

// ============================================
// Job Scheduling Schemas
// ============================================

export const scheduledJobSchema = z.object({
  title: z.string().min(1, 'Job title is required').max(200),
  description: z.string().max(1000).optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).default('scheduled'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  location: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
  projectId: z.string().optional()
});

// ============================================
// Email / Contact Schemas
// ============================================

export const emailFormSchema = z.object({
  recipient: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required').max(200),
  message: z.string().min(1, 'Message is required').max(10000)
});

// ============================================
// Search / Filter Schemas
// ============================================

export const searchSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional()
});

// ============================================
// Export all schemas
// ============================================

export default {
  // Common
  emailValidation,
  phoneValidation,
  positiveNumber,
  positiveNumberString,
  requiredString,

  // Estimates
  clientInfoSchema,
  roomSchema,
  taskSchema,
  estimateSchema,

  // Vendors
  vendorSchema,

  // Receipts
  receiptSchema,
  receiptEditSchema,
  receiptItemSchema,

  // Profile
  profileSchema,
  businessProfileSchema,

  // Follow-ups
  followUpSchema,
  followUpTemplateSchema,

  // Task Templates
  taskTemplateSchema,

  // Job Scheduling
  scheduledJobSchema,

  // Email Form
  emailFormSchema,

  // Search
  searchSchema
};

