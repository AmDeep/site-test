import React, { useState } from 'react';

function UpdatedCheckListPage({ onNext }) {
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
        { check: 'Employee eligibility was confirmed', status: '✔️' },
        { check: 'Eligibility conflicts were resolved', status: '❌' },
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

  return (
    <div style={styles.container}>
      <h2>Updated Checklist</h2>
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
                <div style={styles.reviewContainer}>
                  <ul>
                    {entry.checks.map((check, i) => (
                      <li key={i} style={styles.checkItem}>
                        {check.status === '✔️' ? '✅' : '❌'} {check.check}
                      </li>
                    ))}
                  </ul>
                  <div style={styles.emailSentMessage}>
                    <p>Email has been sent for this task.</p>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={styles.emailSentContainer}>
        <p>Email has been sent successfully!</p>
      </div>
      <div style={styles.emailSentContainer}>
        <p>No more pending tasks, will let you know when we get more issues</p>
      </div>
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
  reviewContainer: {
    marginTop: '10px',
    textAlign: 'left',
    padding: '10px',
    backgroundColor: '#f9f9f9',
    borderRadius: '5px',
  },
  checkItem: {
    padding: '4px 0',
  },
  emailSentMessage: {
    marginTop: '20px',
    color: '#4CAF50',
    fontSize: '16px',
  },
  emailSentContainer: {
    marginTop: '20px',
    color: '#4CAF50',
    fontSize: '18px',
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

export default UpdatedCheckListPage;
