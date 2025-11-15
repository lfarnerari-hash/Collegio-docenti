
import React, { useState, useMemo } from 'react';
import { Signature } from '../types';

type SortKey = keyof Signature;

const SortableHeader: React.FC<{
  label: string;
  sortKey: SortKey;
  sortConfig: { key: SortKey; direction: 'ascending' | 'descending' };
  requestSort: (key: SortKey) => void;
  className?: string;
}> = ({ label, sortKey, sortConfig, requestSort, className }) => {
  const isSorted = sortConfig.key === sortKey;
  const icon = isSorted ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : '';
  return (
    <th
      scope="col"
      className={`px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer ${className}`}
      onClick={() => requestSort(sortKey)}
      aria-sort={isSorted ? (sortConfig.direction === 'ascending' ? 'ascending' : 'descending') : 'none'}
    >
      <span className="flex items-center">
        {label}
        <span className="ml-2 text-slate-400 w-4">{icon}</span>
      </span>
    </th>
  );
};

// FIX: Defined AttendanceListProps interface to resolve TypeScript error.
interface AttendanceListProps {
  signatures: Signature[];
  isAdmin: boolean;
}

const AttendanceList: React.FC<AttendanceListProps> = ({ signatures, isAdmin }) => {
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' }>({ key: 'lastName', direction: 'ascending' });

  const sortedSignatures = useMemo(() => {
      let sortableItems = [...signatures];
      sortableItems.sort((a, b) => {
          const aValue = a[sortConfig.key];
          const bValue = b[sortConfig.key];

          if (aValue < bValue) {
              return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (aValue > bValue) {
              return sortConfig.direction === 'ascending' ? 1 : -1;
          }
          // Secondary sort for names
          if (sortConfig.key === 'lastName') {
              return a.firstName.localeCompare(b.firstName);
          }
           if (sortConfig.key === 'firstName') {
              return a.lastName.localeCompare(b.lastName);
          }
          return 0;
      });
      return sortableItems;
  }, [signatures, sortConfig]);

  const requestSort = (key: SortKey) => {
      let direction: 'ascending' | 'descending' = 'ascending';
      if (sortConfig.key === key && sortConfig.direction === 'ascending') {
          direction = 'descending';
      }
      setSortConfig({ key, direction });
  };

  const exportToCSV = () => {
    if (sortedSignatures.length === 0) {
        alert("Nessuna firma da esportare.");
        return;
    }

    const headers = ['Cognome', 'Nome', 'Email', 'Data e Ora della Firma'];
    const rows = sortedSignatures.map(sig => [
      `"${sig.lastName.replace(/"/g, '""')}"`,
      `"${sig.firstName.replace(/"/g, '""')}"`,
      `"${sig.email.replace(/"/g, '""')}"`,
      `"${sig.timestamp}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const date = new Date().toISOString().slice(0, 10);
    link.setAttribute("download", `firme_collegio_docenti_${date}.csv`);
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-slate-800">Elenco Presenti ({signatures.length})</h2>
        {isAdmin && (
          <button
            onClick={exportToCSV}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300"
            disabled={signatures.length === 0}
            aria-label="Esporta elenco presenze in formato CSV"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Esporta Risultati (CSV)
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-full align-middle">
          <div className="shadow overflow-hidden border-b border-slate-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <SortableHeader label="Cognome" sortKey="lastName" sortConfig={sortConfig} requestSort={requestSort} />
                  <SortableHeader label="Nome" sortKey="firstName" sortConfig={sortConfig} requestSort={requestSort} />
                  <SortableHeader label="Email" sortKey="email" sortConfig={sortConfig} requestSort={requestSort} />
                  <SortableHeader label="Data e Ora" sortKey="timestamp" sortConfig={sortConfig} requestSort={requestSort} />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {sortedSignatures.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-center">
                      Nessun docente ha ancora firmato.
                    </td>
                  </tr>
                ) : (
                  sortedSignatures.map((signature) => (
                    <tr key={signature.email} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        {signature.lastName}
                      </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                        {signature.firstName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {signature.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {signature.timestamp}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceList;