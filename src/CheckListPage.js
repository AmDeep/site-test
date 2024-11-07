import React, { useState } from 'react';

function CheckListPage({ emailSent, onNext }) {
  const [expanded, setExpanded] = useState(null);

  const data = [
    {
      name: 'Getting Eligible Compensation Data',
      status: '✔️',
      description: 'Data has been successfully retrieved.',
      checks: [
        { check: 'Compensation data for all employees was verified', status: '✔️' },
        { check: 'Salary adjustments were accounted for', status: '✔️' },
      ],
    },
    {
      name: 'Auto Enrollment Communication',
      status: '✔️',
      description: 'Communication successfully sent.',
      checks: [
        { check: 'Email notifications were sent to eligible employees', status: '✔️' },
        { check: 'Reminder emails were triggered', status: '✔️' },
      ],
    },
    {
      name: 'Rehire/Hire Dates',
      status: '✔️',
      description: 'Data processed correctly.',
      checks: [
        { check: 'Rehire dates have been updated in the system', status: '✔️' },
        { check: 'Hire dates are properly aligned with employee start dates', status: '✔️' },
      ],
    },
    {
      name: 'Getting Eligible Employee Data',
      status: '❌',
      description: 'Data retrieval incomplete due to missing data.',
      checks: [
        { check: 'Employee eligibility received', status: '✔️' },
        { check: 'All employees enrolled in DC are eligible', status: '❌' },
      ],
    },
    {
      name: 'Confirmation of Eligible Compensation Data Availability',
      status: '✔️',
      description: 'Data is confirmed available for all employees.',
      checks: [
        { check: 'Confirmed that compensation data is available for all employees', status: '✔️' },
        { check: 'Processed compensation data missing for some employees', status: '✔️' },
      ],
    },
  ];

  const handleReview = (index) => {
    setExpanded(expanded === index ? null : index); // Toggle review section
  };

  return (
    <div style={styles.container}>
      <h2>Checklist</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th>Status</th>
            <th>Name</th>
            <th>Check</th>
            <th>Review</th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry, index) => (
            <tr key={index}>
              <td>{entry.status}</td>
              <td>{entry.name}</td>
              <td>{entry.description}</td>
              <td>
                <button
                  style={expanded === index ? { ...styles.reviewButton, backgroundColor: 'grey' } : styles.reviewButton}
                  onClick={() => handleReview(index)}
                >
                  {expanded === index ? 'Hide' : 'Review'}
                </button>
                {expanded === index && (
                  <div style={styles.expandedReview}>
                    <ul>
                      {entry.checks.map((check, i) => (
                        <li key={i} style={styles.checkItem}>
                          {check.status === '✔️' ? '✅' : '❌'} {check.check}
                        </li>
                      ))}
                    </ul>
                    {entry.name === 'Getting Eligible Employee Data' && (
                      <p style={styles.errorText}>
                        Eligibility issue: mismatch — found for 3 entries (John Doe, Jane Smith, Alex Johnson)
                      </p>
                    )}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {emailSent && (
        <div style={styles.emailSentContainer}>
          <p>Email has been sent successfully!</p>
        </div>
      )}

      <button style={styles.nextButton} onClick={onNext}>Proceed to Email Draft</button>
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
  table: {
    width: '100%',
    marginTop: '20px',
    borderCollapse: 'collapse',
  },
  reviewButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '6px 12px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    margin: '10px',
  },
  expandedReview: {
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#f4f7fc',
    borderRadius: '5px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  checkItem: {
    marginBottom: '5px',
    fontSize: '14px',
  },
  errorText: {
    color: 'red',
    fontSize: '14px',
    marginTop: '10px',
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
  emailSentContainer: {
    marginTop: '20px',
    backgroundColor: '#f4f7fc',
    padding: '10px',
    borderRadius: '5px',
  },
};

export default CheckListPage;
