import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

// Set up environment variables for tests (fallback to test values if secrets not available)
process.env.REACT_APP_USER_POOL_ID = process.env.REACT_APP_USER_POOL_ID || 'test-pool-id';
process.env.REACT_APP_CLIENT_ID = process.env.REACT_APP_CLIENT_ID || 'test-client-id';

test('renders app without crashing', () => {
  // Just test that the App component can render without throwing errors
  const { container } = render(<App />);
  expect(container).toBeInTheDocument();
});
