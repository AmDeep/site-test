import React, { useState, useEffect } from 'react';

function OperationStepPage({ onComplete }) {
  const steps = [
    "Pulling Employer Payroll Data",
    "Pulling Employer Eligibility Rules",
    "Pulling FIS results",
    "Comparing...",
    "Done"
  ];
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentStep < steps.length) {
      setProgress(0);  // Reset progress for each new step
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setTimeout(() => {
              if (currentStep < steps.length - 1) {
                setCurrentStep((prevStep) => prevStep + 1);
              } else {
                setIsComplete(true);  // All steps completed
              }
            }, 500);  // Wait 0.5s before moving to next step
            return 100;
          }
          return prev + 5;  // Increase progress by 5% every 100ms (total of 2s to fill)
        });
      }, 100);
    }
  }, [currentStep]);

  const handleNextPage = () => {
    onComplete();  // Trigger the completion callback to move to the next page
  };

  return (
    <div style={styles.container}>
      <h3>{steps[currentStep]}</h3>
      <progress value={progress} max={100} style={styles.progressBar}></progress>
      
      {/* Show next button after all steps are completed */}
      {isComplete && (
        <button style={styles.nextButton} onClick={handleNextPage}>
          Proceed to Next Step
        </button>
      )}
    </div>
  );
}

const styles = {
  container: {
    width: '80%',
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    textAlign: 'center',
    backgroundColor: '#f4f7fc',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  progressBar: {
    width: '100%',
    height: '20px',
    marginTop: '20px',
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

export default OperationStepPage;
