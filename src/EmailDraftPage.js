import React, { useState } from 'react';

function EmailDraftPage({ onSend, onReturnToChecklist }) {
  const [isEditing, setIsEditing] = useState(false);
  const [emailContent, setEmailContent] = useState(`
Hi Jane,
I hope you had a great trip with your family to Orlando last week! How was Disneyworld?

We are trying to finalize your onboarding and noticed that there a few members (John Ellsworth, Jack Stevens, and Lucy Smith) that are ineligible according to your plan docs. 

Please let us know how you want us to proceed within the next 5 business days or they will not be enrolled until verified. 

Thanks!
Phil Hong
  `);
  const [isDraftDeleted, setIsDraftDeleted] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState(''); // New state for recipient email
  const [selectedTone, setSelectedTone] = useState(''); // New state for tone selection
  const [isHovered, setIsHovered] = useState(false); // For hover effect on FIS link

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

  const handleToneSelection = (tone) => {
    setSelectedTone(tone); // Update the tone of the email
    setEmailContent((prevContent) => `${tone}\n\n${prevContent}`);
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
            <h3>Context:</h3>
            <ul>
              <li>Missing eligible employee data</li>
              <li>Incomplete payroll records</li>
              <li>Rehire/Hire date inconsistencies</li>
            </ul>
          </div>

          {/* Recipient Email */}
          <div style={styles.inputContainer}>
            <label htmlFor="emailRecipient">To:</label>
            <input
              id="emailRecipient"
              type="email"
              style={styles.emailInput}
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="Enter recipient email"
            />
          </div>

          {/* Tone of Email Selection */}
          <div style={styles.toneContainer}>
            <h4>Select Tone of Email:</h4>
            <div style={styles.toneList}>
              <div
                style={styles.toneItem}
                onClick={() => handleToneSelection('Friendly and Casual')}
              >
                Friendly and Casual
              </div>
              <div
                style={styles.toneItem}
                onClick={() => handleToneSelection('Professional')}
              >
                Professional
              </div>
              <div
                style={styles.toneItem}
                onClick={() => handleToneSelection('Urgent')}
              >
                Urgent
              </div>
            </div>
          </div>

          {/* Display Email Examples next to Tone Options */}
          <div style={styles.emailExamples}>
            {selectedTone === 'Friendly and Casual' && (
              <div style={styles.emailExample}>
                <h5>Friendly and Casual</h5>
                <p><strong>Subject:</strong> Quick Question about Your Enrollment</p>
                <p>Hey Jane, just wanted to check in regarding your eligibility status...</p>
              </div>
            )}
            {selectedTone === 'Professional' && (
              <div style={styles.emailExample}>
                <h5>Professional</h5>
                <p><strong>Subject:</strong> Eligibility Status Confirmation</p>
                <p>Dear Ms. Jane, I hope this message finds you well. I wanted to bring to your attention...</p>
              </div>
            )}
            {selectedTone === 'Urgent' && (
              <div style={styles.emailExample}>
                <h5>Urgent</h5>
                <p><strong>Subject:</strong> Immediate Action Required: Eligibility Mismatch</p>
                <p>Dear Jane, this is a time-sensitive matter that requires your prompt attention regarding...</p>
              </div>
            )}
          </div>

          {/* FIS File with Hover Popup */}
          <div
            style={styles.fisFileContainer}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <a href="#" style={styles.fisFileLink}>
              FIS File: Ineligible Data
            </a>
            {isHovered && (
              <div style={styles.popup}>
                <table style={styles.popupTable}>
                  <thead>
                    <tr>
                      <th style={styles.popupTableTh}>Employee Name</th>
                      <th style={styles.popupTableTh}>Issue</th>
                      <th style={styles.popupTableTh}>Employee ID</th>
                      <th style={styles.popupTableTh}>Status</th>
                      <th style={styles.popupTableTh}>Date Identified</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={styles.popupTableTd}>John Ellsworth</td>
                      <td style={styles.popupTableTd}>Eligibility Mismatch</td>
                      <td style={styles.popupTableTd}>12345</td>
                      <td style={styles.popupTableTd}>Pending</td>
                      <td style={styles.popupTableTd}>2024-10-05</td>
                    </tr>
                    <tr>
                      <td style={styles.popupTableTd}>Jack Stevens</td>
                      <td style={styles.popupTableTd}>Eligibility Mismatch</td>
                      <td style={styles.popupTableTd}>67890</td>
                      <td style={styles.popupTableTd}>Pending</td>
                      <td style={styles.popupTableTd}>2024-10-07</td>
                    </tr>
                    <tr>
                      <td style={styles.popupTableTd}>Lucy Smith</td>
                      <td style={styles.popupTableTd}>Eligibility Mismatch</td>
                      <td style={styles.popupTableTd}>11223</td>
                      <td style={styles.popupTableTd}>Verified</td>
                      <td style={styles.popupTableTd}>2024-10-06</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
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
  inputContainer: {
    textAlign: 'left',
    width: '100%',
    marginBottom: '10px',
  },
  emailInput: {
    width: '100%',
    padding: '8px',
    fontSize: '14px',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  toneContainer: {
    textAlign: 'left',
    marginBottom: '20px',
  },
  toneList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    cursor: 'pointer',
  },
  toneItem: {
    backgroundColor: '#f4f7fc',
    padding: '8px',
    borderRadius: '5px',
    transition: 'background-color 0.2s ease',
  },
  emailExamples: {
    textAlign: 'left',
    marginTop: '20px',
  },
  emailExample: {
    padding: '10px',
    backgroundColor: '#f9f9f9',
    marginBottom: '10px',
    borderRadius: '5px',
  },
  fisFileContainer: {
    marginBottom: '20px',
    position: 'relative',
  },
  fisFileLink: {
    color: '#007BFF',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  popup: {
    position: 'absolute',
    top: '10px',
    left: '0',
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    padding: '10px',
    borderRadius: '5px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    zIndex: '100',
  },
  popupTable: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  popupTableTh: {
    textAlign: 'left',
    padding: '5px',
    fontWeight: 'bold',
  },
  popupTableTd: {
    padding: '5px',
  },
};

export default EmailDraftPage;
