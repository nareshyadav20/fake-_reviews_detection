import { render, screen } from '@testing-library/react';
import App from './App';

test('renders header Fake Review Detector', () => {
  render(<App />);
  const headerElement = screen.getByText(/Fake Review Detector/i);
  expect(headerElement).toBeInTheDocument();
});

test('renders signup inputs when not logged in', () => {
  render(<App />);
  const nameInput = screen.getByPlaceholderText(/Name/i);
  const usernameInput = screen.getByPlaceholderText(/Username/i);
  const passwordInput = screen.getByPlaceholderText(/Password/i);

  expect(nameInput).toBeInTheDocument();
  expect(usernameInput).toBeInTheDocument();
  expect(passwordInput).toBeInTheDocument();
});

test('renders detect review button after login', () => {
  render(<App />);
  // Initially, Detect Review button should NOT be present
  expect(screen.queryByText(/Detect Review/i)).not.toBeInTheDocument();
});