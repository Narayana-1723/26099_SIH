export const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(d);
  } catch {
    return dateStr;
  }
};

export const formatDateOnly = (dateStr?: string): string => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(d);
  } catch {
    return dateStr;
  }
};

export const formatPercentage = (val?: number): string => {
  if (val === undefined || val === null) return '0%';
  return `${Math.round(val)}%`;
};

export const formatNumber = (val?: number): string => {
  if (val === undefined || val === null) return '0';
  return new Intl.NumberFormat('en-IN').format(val);
};

export const truncateText = (text: string, maxLen = 60): string => {
  if (!text) return '';
  if (text.length <= maxLen) return text;
  return text.substring(0, maxLen) + '...';
};
