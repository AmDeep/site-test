import React, { useState } from 'react';
import { FaGoogle, FaMicrosoft } from 'react-icons/fa'; // Icons for Gmail and Outlook

function SignInPage({ onSignIn }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEmailInputVisible, setIsEmailInputVisible] = useState(false); // For showing email input after selecting sign-in method
  const [selectedMethod, setSelectedMethod] = useState(''); // Track the selected sign-in method (Gmail or Outlook)

  const handleSignIn = () => {
    if (email) {
      setLoading(true);
      setTimeout(() => {
        console.log(`${selectedMethod} Sign-In Successful!`);
        setLoading(false);
        onSignIn();
      }, 2000); // Simulate a 2-second loading time
    }
  };

  const handleSelectSignInMethod = (method) => {
    setSelectedMethod(method);
    setIsEmailInputVisible(true); // Show email input once a method is selected
  };

  return (
    <div style={styles.container}>
      <h2>Sign In</h2>

      {loading && <div style={styles.loadingText}>Signing you in...</div>}

      {/* Email Sign-In Options */}
      {!loading && !isEmailInputVisible && (
        <div style={styles.signInOptions}>
          <button style={styles.signInButton} onClick={() => handleSelectSignInMethod('Gmail')}>
            <FaGoogle style={styles.icon} /> Sign in with Gmail
          </button>
          <button style={styles.signInButton} onClick={() => handleSelectSignInMethod('Outlook')}>
            <FaMicrosoft style={styles.icon} /> Sign in with Outlook
          </button>
        </div>
      )}

      {/* Email Input after Sign-In Method Selection */}
      {!loading && isEmailInputVisible && (
        <div style={styles.emailInputContainer}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.emailInput}
          />
          <button onClick={handleSignIn} style={styles.signInButton}>
            Submit
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  },
  signInOptions: {
    marginTop: '20px',
  },
  signInButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '12px 20px',
    margin: '10px 0',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginRight: '10px',
    fontSize: '20px',
  },
  emailInputContainer: {
    marginTop: '20px',
  },
  emailInput: {
    padding: '10px',
    width: '80%',
    border: '1px solid #ddd',
    borderRadius: '5px',
    marginBottom: '10px',
  },
  loadingText: {
    fontSize: '20px',
    color: '#4CAF50',
    marginBottom: '20px',
  },
};

export default SignInPage;
