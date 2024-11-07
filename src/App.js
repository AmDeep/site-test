import React, { useState } from 'react';
import SignInPage from './SignInPage';
import FISLoginPage from './FISLoginPage';
import FileSelectionPage from './FileSelectionPage';
import OperationStepPage from './OperationStepPage'; // Import the new OperationStepPage component
import CheckListPage from './CheckListPage';
import EmailDraftPage from './EmailDraftPage';
import UpdatedCheckListPage from './UpdatedCheckListPage';

function App() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Helper function to transition between steps
  const goToNextStep = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(step + 1);
      setProgress((prevProgress) => prevProgress + 20); // Increment progress bar
    }, 500); // 0.5 seconds loading animation
  };

  const handleSignIn = () => {
    goToNextStep();
  };

  const handleFISLogin = () => {
    goToNextStep();
  };

  const handleFileSelection = () => {
    goToNextStep();  // Move to the next step after file selection
  };

  const handleOperationStepComplete = () => {
    goToNextStep();  // Move to CheckListPage after operation steps are complete
  };

  const handleCheckList = () => {
    goToNextStep();  // Move to the next step after checklist page
  };

  const handleEmailDraft = () => {
    goToNextStep();
  };

  const handleSendEmail = () => {
    goToNextStep();  // Go to the updated checklist page after email is sent
  };

  return (
    <div style={styles.app}>
      {loading && (
        <div style={styles.loading}>
          <div style={styles.loadingText}>Processing...</div>
          <div style={styles.progressContainer}>
            <div style={{ ...styles.progressBar, width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Conditional rendering of pages based on step */}
      {!loading && step === 1 && <SignInPage onSignIn={handleSignIn} />}
      {!loading && step === 2 && <FISLoginPage onFISLogin={handleFISLogin} />}
      {!loading && step === 3 && <FileSelectionPage onNext={handleFileSelection} />}
      {!loading && step === 4 && <OperationStepPage onComplete={handleOperationStepComplete} />} {/* New Operation Step Page */}
      {!loading && step === 5 && <CheckListPage onNext={handleCheckList} />}
      {!loading && step === 6 && <EmailDraftPage onSend={handleSendEmail} />}
      {!loading && step === 7 && <UpdatedCheckListPage />}
    </div>
  );
}

const styles = {
  app: {
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f4f7fc',
    padding: '30px',
    color: '#333',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    flexDirection: 'column',
    overflow: 'auto',
  },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    zIndex: 9999,
  },
  loadingText: {
    fontSize: '20px',
    color: '#4CAF50',
    marginBottom: '20px',
  },
  progressContainer: {
    width: '100%',
    height: '10px',
    backgroundColor: '#ddd',
    borderRadius: '5px',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    transition: 'width 2s ease-in-out',
  },
};

export default App;
