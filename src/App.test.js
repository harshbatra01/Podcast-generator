import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders upload button', () => {
  render(<App />);
  expect(screen.getByText(/drag and drop/i)).toBeInTheDocument();
});

// Add more tests 