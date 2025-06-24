
import React from 'react';

const InvitedUserSignup = () => {
  console.log('InvitedUserSignup: Component is rendering - TEST');
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1>Invited User Signup - Test</h1>
        <p>If you can see this, the component is rendering correctly</p>
        <p>URL: {window.location.href}</p>
        <p>Search params: {new URLSearchParams(window.location.search).get('token')}</p>
      </div>
    </div>
  );
};

export default InvitedUserSignup;
