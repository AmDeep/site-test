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
  const [recipientEmail, setRecipientEmail] = useState('jane.doe@example.com'); // Hardcoded for demonstration
  const [selectedTone, setSelectedTone] = useState('Friendly and Casual'); // Default tone
  const [showEvidence, setShowEvidence] = useState(false);  // Evidence popup toggle

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
    const emailExamples = {
      'Friendly and Casual': `Hi Jane,\n\nI hope you had a great trip with your family to Orlando last week! How was Disneyworld?\n\nWe are trying to finalize your onboarding and noticed that there are a few members (John Ellsworth, Jack Stevens, and Lucy Smith) that are ineligible according to your plan docs.\n\nLet us know how you'd like to proceed within the next 5 business days. Thanks!\nPhil Hong`,
      'Professional': `Dear Jane,\n\nI hope this message finds you well. We are finalizing your onboarding, and I noticed that a few of the members (John Ellsworth, Jack Stevens, and Lucy Smith) appear to be ineligible based on your plan documents.\n\nKindly provide guidance on how to proceed within the next 5 business days.\n\nBest regards,\nPhil Hong`,
      'Urgent': `Dear Jane,\n\nI need your immediate attention regarding the eligibility of some members (John Ellsworth, Jack Stevens, and Lucy Smith) in your onboarding process.\n\nPlease respond within 48 hours, or we will be unable to proceed with their enrollment.\n\nThanks,\nPhil Hong`
    };
    setEmailContent(emailExamples[tone]);
  };

  const handleToggleEvidence = () => {
    setShowEvidence(!showEvidence); // Toggle visibility of the context evidence
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
          <button style={styles.nextButton} onClick={() => alert("No more pending tasks, will let you know when we get more issues.")}>
            Next
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

            {/* Evidence link for context */}
            <button style={styles.evidenceButton} onClick={handleToggleEvidence}>
              {showEvidence ? 'Hide Evidence' : 'View Evidence'}
            </button>
            {showEvidence && (
              <div style={styles.evidencePopup}>
                <h4>Context Evidence</h4>
                <p><strong>Recipient Email:</strong> {recipientEmail}</p>
                <p><strong>Selected Tone:</strong> {selectedTone}</p>
                <ul>
                  <li><strong>Email Example 1:</strong> Sent to `jane.doe@example.com` with a "Friendly and Casual" tone.</li>
                  <li><strong>Email Example 2:</strong> Sent to `mark.smith@example.com` with a "Professional" tone.</li>
                  <li><strong>Email Example 3:</strong> Sent to `lisa.johnson@example.com` with an "Urgent" tone.</li>
                </ul>
              </div>
            )}
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
  nextButton: {
    backgroundColor: '#FF6347',
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
  evidenceButton: {
    backgroundColor: '#007BFF',
    color: 'white',
    padding: '6px 12px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '20px',
  },
  evidencePopup: {
    backgroundColor: '#f4f7fc',
    padding: '10px',
    borderRadius: '5px',
    marginTop: '20px',
    border: '1px solid #ccc',
  },
};

export default EmailDraftPage;
