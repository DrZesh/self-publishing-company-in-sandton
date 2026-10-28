import {
  Download, FileText, FileSpreadsheet, File, ShieldCheck,
  FileSignature, ClipboardList, Layers, FolderOpen, ScrollText, LayoutTemplate, BookOpen,
} from 'lucide-react';

export const CATEGORIES = [
  'All',
  'NDA',
  'Contract',
  'Agreement',
  'Form',
  'Policy',
  'Template',
  'Publishing Resource',
];

// Admin uses the list without "All"
export const ADMIN_CATEGORIES = ['NDA', 'Contract', 'Agreement', 'Form', 'Policy', 'Template', 'Publishing Resource', 'Other'];

export const FILE_TYPES = ['PDF', 'Word', 'Excel', 'Other'];

export const CATEGORY_ICON = {
  NDA: ShieldCheck,
  Contract: FileSignature,
  Agreement: ClipboardList,
  Form: Layers,
  Policy: ScrollText,
  Template: LayoutTemplate,
  'Publishing Resource': BookOpen,
  Other: FolderOpen,
};

export const FILETYPE_ICON = {
  PDF: FileText,
  Word: File,
  Excel: FileSpreadsheet,
  Other: File,
};

export const FILETYPE_TINT = {
  PDF: '#E4572E',
  Word: '#4A78C4',
  Excel: '#3AA66B',
  Other: '#B8955B',
};

export function formatFileSize(kb) {
  if (!kb || kb <= 0) return null;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export function formatDate(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return null;
  }
}

export { Download };