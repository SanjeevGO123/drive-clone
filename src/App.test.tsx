import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app with login form', () => {
  render(<App />);
  // Check if the login form is rendered
  expect(screen.getByText(/sign in/i)).toBeInTheDocument();
});
