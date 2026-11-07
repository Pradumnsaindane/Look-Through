export interface ParsedCustomerRow {
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'prospect' | 'inactive';
  isValid: boolean;
  errors: string[];
}

export interface CSVParseResult {
  headers: string[];
  rows: ParsedCustomerRow[];
  validCount: number;
  invalidCount: number;
  error?: string;
}

// Pure client-side CSV parser — safe from injection, no eval, handles quotes & newlines
export function parseCSV(text: string): string[][] {
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

export function processCustomerCSV(content: string): CSVParseResult {
  if (!content || !content.trim()) {
    return { headers: [], rows: [], validCount: 0, invalidCount: 0, error: 'The selected CSV file has no content.' };
  }

  const parsedLines = parseCSV(content);
  if (parsedLines.length < 2) {
    return { headers: [], rows: [], validCount: 0, invalidCount: 0, error: 'CSV file must contain a header row and at least one customer row.' };
  }

  const headers = parsedLines[0].map(h => h.toLowerCase().trim());
  const nameIndex = headers.findIndex(h => h.includes('name') || h.includes('customer') || h.includes('company'));
  const emailIndex = headers.findIndex(h => h.includes('email') || h.includes('mail'));
  const phoneIndex = headers.findIndex(h => h.includes('phone') || h.includes('mobile') || h.includes('contact'));
  const statusIndex = headers.findIndex(h => h.includes('status'));

  if (nameIndex === -1) {
    return { headers: parsedLines[0], rows: [], validCount: 0, invalidCount: 0, error: 'Could not detect a "Name" or "Customer" column in your CSV header.' };
  }

  const seenEmails = new Set<string>();
  const rows: ParsedCustomerRow[] = [];

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
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push('Invalid email address format');
      } else if (seenEmails.has(email.toLowerCase())) {
        errors.push('Duplicate email in this file');
      } else {
        seenEmails.add(email.toLowerCase());
      }
    }

    if (phone && phone.length > 32) {
      errors.push('Phone number exceeds 32 characters');
    }

    let status: 'active' | 'prospect' | 'inactive' = 'active';
    if (statusRaw.includes('prospect') || statusRaw.includes('lead') || statusRaw.includes('new')) {
      status = 'prospect';
    } else if (statusRaw.includes('inactive') || statusRaw.includes('churn') || statusRaw.includes('archive')) {
      status = 'inactive';
    }

    rows.push({
      name,
      email,
      phone,
      status,
      isValid: errors.length === 0,
      errors
    });
  }

  const validCount = rows.filter(r => r.isValid).length;
  const invalidCount = rows.length - validCount;

  return {
    headers: parsedLines[0],
    rows,
    validCount,
    invalidCount
  };
}
