import React, { useState } from 'react';

function SignInPage({ onSignIn }) {
  const [loading, setLoading] = useState(false);
  const [isPermissionsVisible, setPermissionsVisible] = useState(false);
  const [accountType, setAccountType] = useState('');
  const [isPermissionAccepted, setIsPermissionAccepted] = useState(false);

  // Handle button click for Gmail or Outlook
  const handleSignIn = (method) => {
    setAccountType(method);
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      setPermissionsVisible(true);
    }, 2000); // 2-second loading animation
  };

  // Handle when the user accepts the permissions
  const handleAcceptPermissions = () => {
    setIsPermissionAccepted(true);
    setTimeout(() => {
      onSignIn(); // Transition to the next page (FIS Login Page)
    }, 1000); // Transition after 1 second delay
  };

  // Handle when the user denies the permissions
  const handleDenyPermissions = () => {
    alert('You have denied the permissions. You cannot proceed.');
  };

  return (
    <div style={styles.container}>
      <h2>Sign In</h2>

      {loading && accountType === 'Outlook' && (
        <div style={styles.outlookLoadingContainer}>
          <div style={styles.loadingText}>Signing you in to Outlook...</div>
          <div style={styles.loadingDots}>
            <span style={styles.dot}></span>
            <span style={styles.dot}></span>
            <span style={styles.dot}></span>
          </div>
        </div>
      )}

      {/* Buttons for Gmail and Outlook */}
      {!loading && !isPermissionsVisible && (
        <div style={styles.signInOptions}>
          <button
            style={styles.signInButton}
            onClick={() => handleSignIn('Gmail')}
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/888/888853.png"
              alt="Gmail"
              style={styles.icon}
            />
            Sign in with Gmail
          </button>
          <button
            style={styles.signInButton}
            onClick={() => handleSignIn('Outlook')}
          >
            <img
              src="https://mailmeteor.com/logos/assets/PNG/Microsoft_Office_Outlook_Logo_512px.png"
              alt="Outlook"
              style={styles.icon}
            />
            Sign in with Outlook
          </button>
        </div>
      )}

      {/* Permissions modal for Gmail/Outlook */}
      {isPermissionsVisible && (
        <div style={styles.permissionsModal}>
          <h3>{accountType} Permissions</h3>
          <p>By continuing, you allow us to access your account information.</p>
          <div style={styles.permissionsDetails}>
            <ul>
              <li>Email address</li>
              <li>Calendar</li>
              <li>Contacts</li>
            </ul>
          </div>
          <div style={styles.buttons}>
            <button
              style={styles.acceptButton}
              onClick={handleAcceptPermissions}
            >
              Accept
            </button>
            <button
              style={styles.denyButton}
              onClick={handleDenyPermissions}
            >
              Deny
            </button>
          </div>
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
    width: '20px',
    height: '20px',
  },
  loadingText: {
    fontSize: '20px',
    color: '#1D6BB8', // Outlook's blue color
    marginBottom: '20px',
  },
  outlookLoadingContainer: {
    backgroundColor: '#1D6BB8', // Outlook blue background
    padding: '30px',
    borderRadius: '8px',
    color: '#fff',
    textAlign: 'center',
  },
  loadingDots: {
    marginTop: '10px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: '10px',
    height: '10px',
    backgroundColor: '#fff',
    borderRadius: '50%',
    margin: '0 5px',
    animation: 'dot-animation 1s infinite alternate',
  },
  permissionsModal: {
    marginTop: '20px',
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    border: '1px solid #ddd',
  },
  permissionsDetails: {
    marginTop: '20px',
    textAlign: 'left',
  },
  buttons: {
    marginTop: '20px',
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  denyButton: {
    backgroundColor: '#FF5733',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default SignInPage;
