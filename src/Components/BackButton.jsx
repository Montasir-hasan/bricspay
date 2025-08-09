import React, { useEffect } from 'react';
import WebApp from '@twa-dev/sdk';

const BackButton = ({ navigateBack }) => {
  useEffect(() => {
    // Show the back button
    WebApp.BackButton.show();

    // Set up the back button click handler
    WebApp.BackButton.onClick(navigateBack);

    // Cleanup function to hide the back button when the component is unmounted
    return () => {
      WebApp.BackButton.offClick(navigateBack);
      WebApp.BackButton.hide();
    };
  }, [navigateBack]);

  return null;
};

export default BackButton;
