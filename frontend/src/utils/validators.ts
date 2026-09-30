import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(3, 'Employee ID or Email must be at least 3 characters'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const uploadFileSchema = z.object({
  cpse: z.string().min(1, 'Please select a CPSE enterprise'),
  file: z.instanceof(File, { message: 'Please select a valid file' }).refine(
    (f) => ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/json'].includes(f.type) ||
      f.name.endsWith('.csv') || f.name.endsWith('.xlsx') || f.name.endsWith('.json'),
    'Only CSV, XLSX, and JSON files are supported'
  ),
});

export const reviewActionSchema = z.object({
  comments: z.string().min(3, 'Review remarks are mandatory (min 3 characters)'),
  modifiedCanonicalCode: z.string().optional(),
});
