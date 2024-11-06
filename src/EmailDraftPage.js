import React, { useState } from 'react';

function EmailDraftPage({ onSend, onReturnToChecklist }) {
  const [isEditing, setIsEditing] = useState(false);
  const [emailContent, setEmailContent] = useState(`
    Dear Concerned Authority,

    We are requesting your attention to the issue with the eligible employee data. The data appears to be incomplete or incorrect, and we kindly ask that it be reviewed and corrected as soon as possible.

    Best regards,
    [Your Name]
  `);
  const [isDraftDeleted, setIsDraftDeleted] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleDelete = () => {
    setIsDraftDeleted(true);
    setEmailContent('');
  };

  const handleSend = () => {
    setEmailSent(true);
    setTimeout(() => {
      onSend(); // Trigger the action for "sending" the email
    }, 1000);
  };

  const handleReturnToChecklist = () => {
    onReturnToChecklist(); // Return to checklist page
  };

  return (
    <div style={styles.container}>
      <h2>Email Draft</h2>

      {emailSent ? (
        <div style={styles.sentMessage}>
          <h3>Email Sent!</h3>
          <p>Your email has been successfully sent. Returning to the checklist page...</p>
          <button style={styles.returnButton} onClick={handleReturnToChecklist}>
            Return to Checklist
          </button>
        </div>
      ) : (
        <div style={styles.emailDraftContainer}>
          <div style={styles.citations}>
            <h3>Citations:</h3>
            <ul>
              <li>Missing eligible employee data</li>
              <li>Incomplete payroll records</li>
              <li>Rehire/Hire date inconsistencies</li>
            </ul>
          </div>

          <textarea
            style={styles.textarea}
            value={emailContent}
            onChange={(e) => setEmailContent(e.target.value)}
            disabled={!isEditing || isDraftDeleted}
          />

          <div style={styles.buttonsContainer}>
            {!isEditing ? (
              <button style={styles.editButton} onClick={handleEdit}>
                Edit
              </button>
            ) : (
              <button style={styles.saveButton} onClick={() => setIsEditing(false)}>
                Save
              </button>
            )}
            <button style={styles.deleteButton} onClick={handleDelete}>
              Delete
            </button>
            <button style={styles.sendButton} onClick={handleSend}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    width: '80%',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  },
  emailDraftContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
  },
  citations: {
    textAlign: 'left',
    marginBottom: '20px',
  },
  textarea: {
    width: '100%',
    height: '200px',
    padding: '10px',
    fontSize: '14px',
    marginBottom: '20px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    resize: 'none',
  },
  buttonsContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: '400px',
  },
  editButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '6px 12px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '6px 12px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  deleteButton: {
    backgroundColor: '#FF6347',
    color: 'white',
    padding: '6px 12px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  sendButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '6px 12px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  sentMessage: {
    textAlign: 'center',
    padding: '20px',
    backgroundColor: '#f4f7fc',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  returnButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '6px 12px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '20px',
  },
};

export default EmailDraftPage;
