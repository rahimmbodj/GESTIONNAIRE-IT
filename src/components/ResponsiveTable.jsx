import React from 'react';

const ResponsiveTable = ({ headers, data, onRowClick, keyField = 'id' }) => {
  // Sur mobile, chaque ligne devient une carte
  const isMobile = window.innerWidth < 768;

  if (isMobile) {
    return (
      <div className="space-y-4">
        {data.map((row) => (
          <div
            key={row[keyField]}
            onClick={() => onRowClick && onRowClick(row)}
            className="bg-white rounded-lg shadow p-4 space-y-2 cursor-pointer hover:shadow-md transition-shadow"
          >
            {headers.map((header) => (
              <div key={header.key} className="flex justify-between">
                <span className="text-gray-600 font-medium">{header.label}:</span>
                <span className="text-gray-900">
                  {typeof header.render === 'function'
                    ? header.render(row[header.key], row)
                    : row[header.key]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  // Sur desktop, on garde le tableau classique
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header) => (
              <th
                key={header.key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row) => (
            <tr
              key={row[keyField]}
              onClick={() => onRowClick && onRowClick(row)}
              className="cursor-pointer hover:bg-gray-50"
            >
              {headers.map((header) => (
                <td key={header.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {typeof header.render === 'function'
                    ? header.render(row[header.key], row)
                    : row[header.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResponsiveTable;
