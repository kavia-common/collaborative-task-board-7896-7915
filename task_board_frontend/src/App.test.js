import { render, screen } from '@testing-library/react';
import AppRoot from './App';

test('renders sign in when logged out', () => {
  render(<AppRoot />);
  const welcome = screen.getByText(/Welcome back/i);
  expect(welcome).toBeInTheDocument();
});
