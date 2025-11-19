import { render, screen } from '@testing-library/react';
import FormStatus from '../../../components/common/FormStatus';

describe('FormStatus Component', () => {
  test('should not render when no message is provided', () => {
    const { container } = render(
      <FormStatus status={{ type: 'success', message: '' }} />
    );
    expect(container.firstChild).toBeNull();
  });

  test('should render success message with correct styling', () => {
    render(
      <FormStatus 
        status={{ 
          type: 'success', 
          message: 'Application submitted successfully!' 
        }} 
      />
    );

    const message = screen.getByText('Application submitted successfully!');
    expect(message).toBeInTheDocument();
    expect(message).toHaveClass('text-green-900');
  });

  test('should render error message with correct styling', () => {
    render(
      <FormStatus 
        status={{ 
          type: 'error', 
          message: 'Submission failed. Please try again.' 
        }} 
      />
    );

    const message = screen.getByText('Submission failed. Please try again.');
    expect(message).toBeInTheDocument();
    expect(message).toHaveClass('text-red-900');
  });

  test('should display AI summary when provided', () => {
    const summary = 'This is an AI-generated summary of the application.';
    
    render(
      <FormStatus 
        status={{ 
          type: 'success', 
          message: 'Success!',
          summary: summary
        }} 
      />
    );

    expect(screen.getByText('AI-Generated Summary')).toBeInTheDocument();
    expect(screen.getByText(summary)).toBeInTheDocument();
  });

  test('should not display summary section when summary is empty', () => {
    render(
      <FormStatus 
        status={{ 
          type: 'success', 
          message: 'Success!' 
        }} 
      />
    );

    expect(screen.queryByText('AI-Generated Summary')).not.toBeInTheDocument();
  });

  test('should render success icon for success type', () => {
    const { container } = render(
      <FormStatus 
        status={{ 
          type: 'success', 
          message: 'Success!' 
        }} 
      />
    );

    // Check for checkmark path in SVG
    const checkmarkPath = container.querySelector('path[d*="M5 13l4 4L19 7"]');
    expect(checkmarkPath).toBeInTheDocument();
  });

  test('should render error icon for error type', () => {
    const { container } = render(
      <FormStatus 
        status={{ 
          type: 'error', 
          message: 'Error!' 
        }} 
      />
    );

    // Check for exclamation mark icon
    const errorPath = container.querySelector('path[d*="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"]');
    expect(errorPath).toBeInTheDocument();
  });
});
