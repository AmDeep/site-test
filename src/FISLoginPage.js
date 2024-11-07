import React, { useState } from 'react';

function FISLoginPage({ onFISLogin }) {
  const [selectedOption, setSelectedOption] = useState('');

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleLogin = () => {
    if (selectedOption) {
      onFISLogin(); // Proceed to next step after selecting the login option
    }
  };

  return (
    <div style={styles.container}>
      <h2>Login to Financial System</h2>

      <p>Please choose your financial system login:</p>

      <div style={styles.optionsContainer}>
        <label style={styles.optionLabel}>
          <input
            type="radio"
            name="fisOption"
            value="FIS Relius"
            checked={selectedOption === 'FIS Relius'}
            onChange={handleOptionChange}
            style={styles.radioInput}
          />
          FIS Relius
        </label>
        <label style={styles.optionLabel}>
          <input
            type="radio"
            name="fisOption"
            value="FIS Omni"
            checked={selectedOption === 'FIS Omni'}
            onChange={handleOptionChange}
            style={styles.radioInput}
          />
          FIS Omni
        </label>
        <label style={styles.optionLabel}>
          <input
            type="radio"
            name="fisOption"
            value="FT Williams"
            checked={selectedOption === 'FT Williams'}
            onChange={handleOptionChange}
            style={styles.radioInput}
          />
          FT Williams
        </label>
        <label style={styles.optionLabel}>
          <input
            type="radio"
            name="fisOption"
            value="SS&C"
            checked={selectedOption === 'SS&C'}
            onChange={handleOptionChange}
            style={styles.radioInput}
          />
          SS&C
        </label>
      </div>

      <div style={styles.buttonContainer}>
        <button
          onClick={handleLogin}
          disabled={!selectedOption}
          style={styles.loginButton}
        >
          Login
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '80%',
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  },
  optionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '20px',
  },
  optionLabel: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px',
    fontSize: '16px',
    cursor: 'pointer',
    justifyContent: 'flex-start',
  },
  radioInput: {
    marginRight: '10px',
    transform: 'scale(1.2)', // Slightly larger radio buttons
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    width: '100%',
    maxWidth: '200px',
  },
};

export default FISLoginPage;
