import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  RefreshCw,
  ArrowRight,
  Check
} from 'lucide-react';
import { saveCustomer } from './customerApi';
import { mutate as mutateSWR } from 'swr';
import { useBusiness } from '../../context/BusinessContext';

interface ParsedCustomerRow {
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'prospect' | 'inactive';
  isValid: boolean;
  errors: string[];
}

interface CustomerImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Pure client-side CSV parser — safe from injection, no eval, handles quotes
function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuote = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuote && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === ',' && !insideQuote) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuote) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentField.trim());
      if (currentRow.some(field => field.length > 0)) {
        lines.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some(field => field.length > 0)) {
      lines.push(currentRow);
    }
  }

  return lines;
}

export const CustomerImportModal: React.FC<CustomerImportModalProps> = ({ isOpen, onClose }) => {
  const { addToast } = useBusiness();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'completed'>('upload');
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState<ParsedCustomerRow[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<{ success: number; failed: number }>({ success: 0, failed: 0 });

  if (!isOpen) return null;

  const handleReset = () => {
    setStep('upload');
    setFileName('');
    setRows([]);
    setImportProgress(0);
    setImportResults({ success: 0, failed: 0 });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      addToast({
        type: 'error',
        title: 'Invalid File',
        description: 'Please upload a standard .csv file format.',
      });
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content || !content.trim()) {
        addToast({
          type: 'error',
          title: 'Empty File',
          description: 'The selected CSV file has no content.',
        });
        return;
      }

      const parsedLines = parseCSV(content);
      if (parsedLines.length < 2) {
        addToast({
          type: 'error',
          title: 'Insufficient Data',
          description: 'CSV file must contain a header row and at least one customer row.',
        });
        return;
      }

      const headers = parsedLines[0].map(h => h.toLowerCase().trim());
      const nameIndex = headers.findIndex(h => h.includes('name') || h.includes('customer') || h.includes('company'));
      const emailIndex = headers.findIndex(h => h.includes('email') || h.includes('mail'));
      const phoneIndex = headers.findIndex(h => h.includes('phone') || h.includes('mobile') || h.includes('contact'));
      const statusIndex = headers.findIndex(h => h.includes('status'));

      if (nameIndex === -1) {
        addToast({
          type: 'error',
          title: 'Missing Header',
          description: 'Could not detect a "Name" or "Customer" column in your CSV header.',
        });
        return;
      }

      const seenEmails = new Set<string>();
      const processed: ParsedCustomerRow[] = [];

      for (let i = 1; i < parsedLines.length; i++) {
        const line = parsedLines[i];
        const name = (line[nameIndex] || '').trim();
        const email = emailIndex !== -1 ? (line[emailIndex] || '').trim() : '';
        const phone = phoneIndex !== -1 ? (line[phoneIndex] || '').trim() : '';
        const statusRaw = statusIndex !== -1 ? (line[statusIndex] || '').trim().toLowerCase() : 'active';

        const errors: string[] = [];
        if (!name) {
          errors.push('Name is required');
        } else if (name.length > 160) {
          errors.push('Name exceeds 160 characters');
        }

        if (email) {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push('Invalid email format');
          } else if (seenEmails.has(email.toLowerCase())) {
            errors.push('Duplicate email in file');
          } else {
            seenEmails.add(email.toLowerCase());
          }
        }

        const status = statusRaw === 'prospect' || statusRaw === 'new'
          ? 'prospect'
          : statusRaw === 'inactive' || statusRaw === 'at risk'
          ? 'inactive'
          : 'active';

        processed.push({
          name,
          email,
          phone,
          status,
          isValid: errors.length === 0,
          errors,
        });
      }

      setRows(processed);
      setStep('preview');
    };

    reader.readAsText(file);
  };

  const handleStartImport = async () => {
    const validRows = rows.filter(r => r.isValid);
    if (!validRows.length) return;

    setStep('importing');
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      try {
        await saveCustomer({
          name: row.name,
          email: row.email || undefined,
          phone: row.phone || undefined,
        });
        successCount++;
      } catch (err) {
        console.error(`Failed to import row for ${row.name}:`, err);
        failCount++;
      }
      setImportProgress(Math.round(((i + 1) / validRows.length) * 100));
    }

    setImportResults({ success: successCount, failed: failCount });
    setStep('completed');

    // Revalidate customer lists and dashboard counts
    await mutateSWR((key) => typeof key === 'string' && key.startsWith('/api/customers'));
    await mutateSWR('/api/dashboard');

    addToast({
      type: successCount > 0 ? 'success' : 'error',
      title: 'Import Completed',
      description: `Successfully added ${successCount} customers (${failCount} failed).`,
    });
  };

  const validCount = rows.filter(r => r.isValid).length;
  const invalidCount = rows.filter(r => !r.isValid).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Import Customers from CSV</h2>
              <p className="text-xs text-slate-400">Scoped strictly to your authenticated organization</p>
            </div>
          </div>
          <button
            onClick={() => { handleReset(); onClose(); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar flex-1">
          {step === 'upload' && (
            <div className="space-y-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-950/40 hover:bg-slate-900/60 flex flex-col items-center justify-center gap-3"
              >
                <div className="p-3 rounded-full bg-blue-500/10 text-blue-400">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">Click to upload or drag & drop</p>
                  <p className="text-xs text-slate-400 mt-1">Comma-separated .csv file (Max 500 rows per batch)</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 space-y-1.5">
                <p className="font-semibold text-slate-200">Supported CSV columns:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li><strong className="text-slate-300">Name</strong> (required) — Customer or Company name</li>
                  <li><strong className="text-slate-300">Email</strong> (optional) — Primary email address for invoicing</li>
                  <li><strong className="text-slate-300">Phone</strong> (optional) — Contact telephone or mobile</li>
                  <li><strong className="text-slate-300">Status</strong> (optional) — Active, Prospect, or Inactive</li>
                </ul>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">File: <span className="font-semibold text-slate-200">{fileName}</span></p>
                  <p className="text-xs text-slate-400 mt-0.5">Found {rows.length} total rows</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {validCount} Ready
                  </span>
                  {invalidCount > 0 && (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      {invalidCount} Invalid (will be skipped)
                    </span>
                  )}
                </div>
              </div>

              {/* Preview Table */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Name</th>
                      <th className="py-2.5 px-3">Email</th>
                      <th className="py-2.5 px-3">Phone</th>
                      <th className="py-2.5 px-3">Validation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {rows.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className={row.isValid ? 'hover:bg-slate-900/30' : 'bg-rose-950/10'}>
                        <td className="py-2.5 px-3 font-semibold text-slate-200">{row.name || <span className="text-rose-400 italic">Missing</span>}</td>
                        <td className="py-2.5 px-3 text-slate-300">{row.email || '—'}</td>
                        <td className="py-2.5 px-3 text-slate-400">{row.phone || '—'}</td>
                        <td className="py-2.5 px-3">
                          {row.isValid ? (
                            <span className="flex items-center gap-1 text-emerald-400 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-rose-400 font-medium" title={row.errors.join(', ')}>
                              <AlertCircle className="w-3.5 h-3.5" /> {row.errors[0]}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {rows.length > 5 && (
                <p className="text-[11px] text-slate-500 text-center">
                  Showing first 5 of {rows.length} rows. All {validCount} valid rows will be imported.
                </p>
              )}
            </div>
          )}

          {step === 'importing' && (
            <div className="py-8 text-center space-y-4">
              <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
              <div>
                <p className="text-sm font-bold text-slate-100">Importing customer accounts...</p>
                <p className="text-xs text-slate-400 mt-1">Please do not close this window</p>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5 max-w-md mx-auto overflow-hidden">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${importProgress}%` }}
                />
              </div>
              <p className="text-xs font-mono text-slate-400">{importProgress}% completed</p>
            </div>
          )}

          {step === 'completed' && (
            <div className="py-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Import Batch Finished</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Successfully persisted {importResults.success} accounts into your organization's CRM.
                </p>
                {importResults.failed > 0 && (
                  <p className="text-xs text-rose-400 mt-0.5">
                    {importResults.failed} accounts encountered errors and were skipped.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/60">
          {step === 'upload' && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
              >
                Cancel
              </button>
              <div />
            </>
          )}

          {step === 'preview' && (
            <>
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
              >
                Choose Another File
              </button>
              <button
                type="button"
                disabled={validCount === 0}
                onClick={handleStartImport}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md transition-all"
              >
                <span>Import {validCount} Accounts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {step === 'completed' && (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={() => { handleReset(); onClose(); }}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-md"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
