import React from 'react'

function Mobile() {
  return (
    <div>

        <div style={styles.desktop}>
          {/* Desktop View */}
          <h1>🚫 Access Restricted</h1>
          <p>Please use a mobile device to access this site.</p>
        </div>

    </div>
  )
}

const styles = {
  desktop: {
    textAlign: 'center',
    marginTop: '20%',
    fontFamily: 'Arial, sans-serif',
    color: '#333',
    backgroundColor: '#f8d7da',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #f5c6cb',
  },
};


export default Mobile
