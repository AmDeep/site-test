import React, { useState, useEffect } from 'react';

function FileSelectionPage({ onNext }) {
  const [isProcessing, setIsProcessing] = useState(true);
  const [currentMessage, setCurrentMessage] = useState("Pulling data from emails...");
  const [files, setFiles] = useState([]);
  const [isProgrammerScreenVisible, setIsProgrammerScreenVisible] = useState(false);
  const [isFilesVisible, setIsFilesVisible] = useState(false);
  const [typedCode, setTypedCode] = useState('');
  const [terminalOutput, setTerminalOutput] = useState('');

const codeSnippets = `# Linux Operations:
echo "Pulling data from emails..."
sleep 2
echo "Emails fetched: email1@example.com, email2@example.com"
echo "Pulling files..."
sleep 2
echo "Files fetched: payroll_data.csv, employee_records.xlsx"

# Python Operations:
import os
import time

def fetch_data():
    print("Fetching data from directory...")
    files = os.listdir("/data/files/")
    print("Files found:", files)
    return files

files = fetch_data()

# System Check:
df -h
ls -l /data/files/
`;

  const outputText = `# Terminal Output:
> Pulling data from emails...
> Emails fetched: email1@example.com, email2@example.com
>
> Pulling files...
> Files fetched: payroll_data.csv, employee_records.xlsx
>
> Fetching data from directory...
> Files found: ['payroll_data.csv', 'employee_records.xlsx']
>
> Disk Usage:
> Filesystem      Size  Used Avail Use% Mounted on
> /dev/sda1       100G   30G  70G  30% /data
> 
> Listing Files:
> -rwxr-xr-x 1 user user 1.5M Nov 1 10:00 payroll_data.csv
> -rwxr-xr-x 1 user user  900K Oct 28 12:30 employee_records.xlsx
`;

  useEffect(() => {
    setTimeout(() => {
      setCurrentMessage("Pulling files...");
      setTimeout(() => {
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
        setIsProgrammerScreenVisible(true);

        setTimeout(() => {
          setIsProgrammerScreenVisible(false);
          setIsFilesVisible(true);
        }, 10000);
      }, 2000); 
    }, 2000);
  }, []);

  useEffect(() => {
    if (isProgrammerScreenVisible) {
      let codeIndex = 0;
      let outputIndex = 0;

      const codeInterval = setInterval(() => {
        if (codeIndex < codeSnippets.length) {
          setTypedCode((prev) => prev + codeSnippets[codeIndex]);
          codeIndex++;
        } else {
          clearInterval(codeInterval);
        }
      }, 50);

      setTimeout(() => {
        const outputInterval = setInterval(() => {
          if (outputIndex < outputText.length) {
            setTerminalOutput((prev) => prev + outputText[outputIndex]);
            outputIndex++;
          } else {
            clearInterval(outputInterval);
          }
        }, 50);
      }, codeSnippets.length * 50);
    }
  }, [isProgrammerScreenVisible]);

  const handleNext = () => {
    onNext();
  };

  return (
    <div style={styles.container}>
      <h2>File Selection</h2>

      {isProcessing && (
        <div style={styles.processingContainer}>
          <div style={styles.processingText}>{currentMessage}</div>
        </div>
      )}

      {/* Programmer screen showing typed code */}
      {isProgrammerScreenVisible && (
        <div style={styles.programmingScreen}>
          <div style={styles.codeScreen}>
            <pre style={styles.codeBlock}>
              {typedCode}
            </pre>
            <div style={styles.executionResultContainer}>
              <div style={styles.executionText}>Executing...</div>
              <div style={styles.executionResult}>
                <pre>
                  {terminalOutput}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Files table after the programmer screen */}
      {isFilesVisible && (
        <div style={styles.filesContainer}>
          <h3>Files Processed:</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>File Name</th>
                <th style={styles.tableHeader}>Size</th>
                <th style={styles.tableHeader}>Uploaded On</th>
                <th style={styles.tableHeader}>Details</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file, index) => (
                <tr key={index}>
                  <td style={styles.tableCell}>{file.name}</td>
                  <td style={styles.tableCell}>{file.size}</td>
                  <td style={styles.tableCell}>{file.uploaded}</td>
                  <td style={styles.tableCell}>{file.details}</td>
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
    marginTop: '20px',
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
  programmingScreen: {
    marginTop: '40px',
    textAlign: 'left',
    backgroundColor: '#000',
    padding: '20px',
    borderRadius: '8px',
    color: '#00FF00',
    fontFamily: 'monospace',
    overflowY: 'auto',
    height: '300px',
    width: '100%',
  },
  codeScreen: {
    marginBottom: '20px',
  },
  codeBlock: {
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    fontSize: '16px',
    lineHeight: '1.5',
  },
  executionResultContainer: {
    marginTop: '20px',
    backgroundColor: '#222',
    padding: '10px',
    borderRadius: '8px',
  },
  executionResult: {
    color: '#FFFFFF',
    fontSize: '14px',
  },
  executionText: {
    color: '#66FF66',
  },
};

export default FileSelectionPage;
