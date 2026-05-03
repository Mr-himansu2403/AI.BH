import { extractErrorMessage } from './AuthContext';

describe('extractErrorMessage', () => {
  it('extracts API error response', () => {
    const error = {
      response: {
        data: {
          message: 'Invalid credentials'
        }
      }
    };
    expect(extractErrorMessage(error)).toBe('Invalid credentials');
  });

  it('extracts network error message', () => {
    const error = {
      message: 'Network Error'
    };
    expect(extractErrorMessage(error)).toBe('Unable to connect to server. Please try again.');
  });

  it('extracts timeout error message', () => {
    const error = {
      code: 'ECONNABORTED'
    };
    expect(extractErrorMessage(error)).toBe('Request timed out. Please try again.');
  });

  it('falls back to generic error message', () => {
    const error = {
      message: 'Something weird happened'
    };
    expect(extractErrorMessage(error)).toBe('Something weird happened');
    
    const emptyError = {};
    expect(extractErrorMessage(emptyError)).toBe('An unexpected error occurred');
  });
});
