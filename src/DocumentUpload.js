import React from 'react';

const files = [
  {
    name: 'Payroll File (dummy.csv)',
    size: '1.2 MB',
    uploaded: '2024-11-01',
    details: 'Contains payroll information for employees including salaries and bonuses.',
  },
  {
    name: 'Record Keeping File (dummy.xlsx)',
    size: '800 KB',
    uploaded: '2024-10-28',
    details: 'Contains records of employee contributions, enrollments, and adjustments.',
  },
];

function DocumentUploadPage() {
  return (
    <div style={styles.container}>
      <h2>Document Upload</h2>

      {/* File Upload Simulation Animation */}
      <div style={styles.fileUploadAnimation}>
        <div style={styles.loadingText}>Pulling data from emails...</div>
        <div style={styles.loadingText}>Pulling files...</div>
      </div>

      {/* Table for displaying file details */}
      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHeader}>
            <th style={styles.tableCell}>File Name</th>
            <th style={styles.tableCell}>Size</th>
            <th style={styles.tableCell}>Uploaded On</th>
            <th style={styles.tableCell}>Details</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file, index) => (
            <tr key={index} style={styles.tableRow}>
              <td style={styles.tableCell}>{file.name}</td>
              <td style={styles.tableCell}>{file.size}</td>
              <td style={styles.tableCell}>{file.uploaded}</td>
              <td style={styles.tableCell}>{file.details}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  container: {
    width: '80%',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  },
  fileUploadAnimation: {
    marginBottom: '20px',
    fontSize: '18px',
    color: '#4CAF50',
  },
  loadingText: {
    fontSize: '20px',
    marginBottom: '10px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    backgroundColor: '#f4f4f4',
    fontWeight: 'bold',
  },
  tableRow: {
    borderBottom: '1px solid #ddd',
  },
  tableCell: {
    padding: '10px',
    border: '1px solid #ddd',
    textAlign: 'left',
  },
};

export default DocumentUploadPage;
