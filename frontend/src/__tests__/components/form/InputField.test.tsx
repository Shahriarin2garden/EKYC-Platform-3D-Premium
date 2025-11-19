import { render, screen, fireEvent } from '@testing-library/react';
import InputField from '../../../components/form/InputField';

describe('InputField Component', () => {
  const defaultProps = {
    label: 'Test Label',
    id: 'test-input',
    name: 'testInput',
    value: '',
    onChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render input field with label', () => {
    render(<InputField {...defaultProps} />);

    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    expect(screen.getByLabelText('Test Label')).toHaveAttribute('id', 'test-input');
  });

  test('should display required asterisk when required is true', () => {
    render(<InputField {...defaultProps} required />);

    const asterisk = screen.getByText('*');
    expect(asterisk).toBeInTheDocument();
    expect(asterisk).toHaveClass('text-red-500');
  });

  test('should call onChange handler when value changes', () => {
    const handleChange = jest.fn();
    render(<InputField {...defaultProps} onChange={handleChange} />);

    const input = screen.getByLabelText('Test Label') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'new value' } });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  test('should display placeholder text', () => {
    render(<InputField {...defaultProps} placeholder="Enter text here" />);

    const input = screen.getByPlaceholderText('Enter text here');
    expect(input).toBeInTheDocument();
  });

  test('should show success icon when valid', () => {
    const { container } = render(
      <InputField 
        {...defaultProps} 
        value="valid value" 
        showSuccessIcon 
      />
    );

    // Check for success checkmark icon
    const successIcon = container.querySelector('path[d*="M5 13l4 4L19 7"]');
    expect(successIcon).toBeInTheDocument();
  });

  test('should show error icon when error is present', () => {
    const { container } = render(
      <InputField 
        {...defaultProps} 
        error="This field is required" 
      />
    );

    // Check for error X icon
    const errorIcon = container.querySelector('path[d*="M6 18L18 6M6 6l12 12"]');
    expect(errorIcon).toBeInTheDocument();
  });

  test('should display error message', () => {
    render(
      <InputField 
        {...defaultProps} 
        error="Invalid input value" 
      />
    );

    expect(screen.getByText('Invalid input value')).toBeInTheDocument();
  });

  test('should apply error styling when error is present', () => {
    render(
      <InputField 
        {...defaultProps} 
        error="Error message" 
      />
    );

    const input = screen.getByLabelText('Test Label');
    expect(input).toHaveClass('border-red-400');
  });

  test('should apply focus styling when isFocused is true', () => {
    render(
      <InputField 
        {...defaultProps} 
        isFocused 
      />
    );

    const input = screen.getByLabelText('Test Label');
    expect(input).toHaveClass('border-blue-400');
  });

  test('should call onFocus handler', () => {
    const handleFocus = jest.fn();
    render(<InputField {...defaultProps} onFocus={handleFocus} />);

    const input = screen.getByLabelText('Test Label');
    fireEvent.focus(input);

    expect(handleFocus).toHaveBeenCalledTimes(1);
  });

  test('should call onBlur handler', () => {
    const handleBlur = jest.fn();
    render(<InputField {...defaultProps} onBlur={handleBlur} />);

    const input = screen.getByLabelText('Test Label');
    fireEvent.blur(input);

    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  test('should accept different input types', () => {
    const { rerender } = render(<InputField {...defaultProps} type="email" />);
    expect(screen.getByLabelText('Test Label')).toHaveAttribute('type', 'email');

    rerender(<InputField {...defaultProps} type="tel" />);
    expect(screen.getByLabelText('Test Label')).toHaveAttribute('type', 'tel');

    rerender(<InputField {...defaultProps} type="number" />);
    expect(screen.getByLabelText('Test Label')).toHaveAttribute('type', 'number');
  });

  test('should display value correctly', () => {
    render(<InputField {...defaultProps} value="Test Value" />);

    const input = screen.getByLabelText('Test Label') as HTMLInputElement;
    expect(input.value).toBe('Test Value');
  });
});
