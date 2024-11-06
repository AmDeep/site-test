import React, { useState, useEffect } from 'react';

function FileSelectionPage({ onNext }) {
  const [isProcessing, setIsProcessing] = useState(true);
  const [currentMessage, setCurrentMessage] = useState("Pulling data from emails...");
  const [files, setFiles] = useState([]);
  
  useEffect(() => {
    setTimeout(() => {
      setCurrentMessage("Pulling files...");
      setTimeout(() => {
        // Simulate file data
        setFiles([
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
          }
        ]);
        setIsProcessing(false);
      }, 2000); // Simulate time for pulling files
    }, 2000); // Simulate time for pulling data from emails
  }, []);

  const handleNext = () => {
    onNext();
  };

  return (
    <div style={styles.container}>
      <h2>File Selection</h2>
      
      {/* Processing Animation */}
      {isProcessing ? (
        <div style={styles.processingContainer}>
          <div style={styles.processingText}>{currentMessage}</div>
        </div>
      ) : (
        <div style={styles.filesContainer}>
          <h3>Files Processed:</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>File Name</th>
                <th>Size</th>
                <th>Uploaded On</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file, index) => (
                <tr key={index}>
                  <td>{file.name}</td>
                  <td>{file.size}</td>
                  <td>{file.uploaded}</td>
                  <td>{file.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button style={styles.nextButton} onClick={handleNext}>Proceed to Next Step</button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    width: '80%',
    maxWidth: '900px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  },
  processingContainer: {
    padding: '20px',
    backgroundColor: '#f4f7fc',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  processingText: {
    fontSize: '18px',
    color: '#4CAF50',
  },
  filesContainer: {
    padding: '20px',
    backgroundColor: '#f4f7fc',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  table: {
    width: '100%',
    marginTop: '20px',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '10px',
  },
  tableCell: {
    padding: '10px',
    border: '1px solid #ddd',
  },
  nextButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '20px',
  },
};

export default FileSelectionPage;
