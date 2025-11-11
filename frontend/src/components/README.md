# KYC Form Components

This directory contains reusable React components for the KYC (Know Your Customer) form application.

## Directory Structure

```
components/
├── form/               # Form input components
│   ├── InputField.tsx
│   └── TextAreaField.tsx
├── layout/             # Layout and container components
│   ├── FormContainer.tsx
│   ├── FormCard.tsx
│   └── FormHeader.tsx
├── common/             # Common/shared components
│   ├── FormStatus.tsx
│   ├── SubmitButton.tsx
│   └── SecurityBadge.tsx
└── index.ts            # Barrel export file
```

## Components Overview

### Form Components

#### `InputField`
A reusable input field component with built-in validation, focus states, and error handling.

**Props:**
- `label` (string): Field label text
- `id` (string): HTML id attribute
- `name` (string): Form field name
- `type` (string): Input type (text, email, tel, number)
- `value` (string): Current value
- `onChange` (function): Change event handler
- `onFocus` (function): Focus event handler
- `onBlur` (function): Blur event handler
- `placeholder` (string): Placeholder text
- `required` (boolean): Whether field is required
- `error` (string): Error message to display
- `isFocused` (boolean): Whether field is currently focused
- `showSuccessIcon` (boolean): Show success checkmark when valid

**Usage:**
```tsx
<InputField
  label="Full Name"
  id="name"
  name="name"
  type="text"
  value={formData.name}
  onChange={handleChange}
  placeholder="John Doe"
  required
  error={errors.name}
  isFocused={focusedField === 'name'}
  showSuccessIcon
/>
```

#### `TextAreaField`
A reusable textarea component with focus states.

**Props:**
- `label` (string): Field label text
- `id` (string): HTML id attribute
- `name` (string): Form field name
- `value` (string): Current value
- `onChange` (function): Change event handler
- `onFocus` (function): Focus event handler
- `onBlur` (function): Blur event handler
- `placeholder` (string): Placeholder text
- `rows` (number): Number of visible text rows
- `required` (boolean): Whether field is required
- `isFocused` (boolean): Whether field is currently focused

**Usage:**
```tsx
<TextAreaField
  label="Address"
  id="address"
  name="address"
  value={formData.address}
  onChange={handleChange}
  placeholder="123 Main Street"
  rows={3}
  isFocused={focusedField === 'address'}
/>
```

### Layout Components

#### `FormContainer`
Main container wrapper for the entire form page with gradient background.

**Props:**
- `children` (ReactNode): Child components to render

**Usage:**
```tsx
<FormContainer>
  <FormHeader />
  <FormCard onSubmit={handleSubmit}>
    {/* Form fields */}
  </FormCard>
</FormContainer>
```

#### `FormCard`
Card wrapper for the form with styling and shadow effects.

**Props:**
- `children` (ReactNode): Form fields and elements
- `onSubmit` (function): Form submission handler

**Usage:**
```tsx
<FormCard onSubmit={handleSubmit}>
  <InputField {...props} />
  <SubmitButton loading={loading} />
</FormCard>
```

#### `FormHeader`
Header section with logo, title, and description.

**Usage:**
```tsx
<FormHeader />
```

### Common Components

#### `FormStatus`
Displays success or error messages with AI-generated summaries.

**Props:**
- `status` (FormStatus): Status object with type, message, and optional summary

**Usage:**
```tsx
<FormStatus status={status} />
```

#### `SubmitButton`
Submit button with loading state and animations.

**Props:**
- `loading` (boolean): Whether form is being submitted
- `disabled` (boolean): Whether button is disabled
- `children` (ReactNode): Custom button content (optional)
- `type` (string): Button type (submit, button, reset)

**Usage:**
```tsx
<SubmitButton loading={loading} />
```

#### `SecurityBadge`
Displays security and encryption badge at the bottom of the form.

**Usage:**
```tsx
<SecurityBadge />
```

## Component Features

### Styling
- **Tailwind CSS**: All components use Tailwind utility classes
- **Responsive Design**: Mobile-first responsive layouts
- **Animations**: Smooth transitions and hover effects
- **Focus States**: Visual feedback for focused inputs
- **Error States**: Red borders and error messages for invalid inputs
- **Success States**: Green checkmarks for valid inputs

### Accessibility
- Proper label associations with `htmlFor` attributes
- Required field indicators (*)
- ARIA-compliant form elements
- Keyboard navigation support

### Best Practices
- **Type Safety**: Full TypeScript support with defined interfaces
- **Separation of Concerns**: Each component has a single responsibility
- **Reusability**: Components are generic and can be used in multiple forms
- **Customization**: Props allow for flexible configuration
- **Performance**: Optimized re-renders with proper prop handling

## Usage Example

Complete example of using components together:

```tsx
import React, { useState } from 'react';
import {
  FormContainer,
  FormHeader,
  FormCard,
  InputField,
  TextAreaField,
  FormStatus,
  SubmitButton,
  SecurityBadge
} from '../components';
import { KycFormData, FormStatus as FormStatusType } from '../types';

function MyForm() {
  const [formData, setFormData] = useState<KycFormData>({
    name: '',
    email: '',
    address: '',
    nid: '',
    occupation: ''
  });
  const [status, setStatus] = useState<FormStatusType>({
    type: '',
    message: '',
    summary: ''
  });
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Submit logic here
    setLoading(false);
  };

  return (
    <FormContainer>
      <FormHeader />
      <FormCard onSubmit={handleSubmit}>
        <InputField
          label="Full Name"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          onFocus={() => setFocusedField('name')}
          onBlur={() => setFocusedField('')}
          required
          error={errors.name}
          isFocused={focusedField === 'name'}
          showSuccessIcon
        />

        <TextAreaField
          label="Address"
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          onFocus={() => setFocusedField('address')}
          onBlur={() => setFocusedField('')}
          rows={3}
          isFocused={focusedField === 'address'}
        />

        <FormStatus status={status} />
        <SubmitButton loading={loading} />
        <SecurityBadge />
      </FormCard>
    </FormContainer>
  );
}
```

## Future Enhancements

Potential improvements for the component library:

1. **More Input Types**: Date pickers, select dropdowns, radio buttons, checkboxes
2. **Form Validation**: Built-in validation library integration (e.g., Yup, Zod)
3. **File Upload**: Component for document upload with preview
4. **Multi-step Forms**: Wizard/stepper component for complex forms
5. **Auto-complete**: Search suggestions for inputs
6. **Internationalization**: Multi-language support
7. **Theme Support**: Dark mode and custom theme configurations
8. **Unit Tests**: Comprehensive test coverage with Jest/React Testing Library
9. **Storybook**: Component documentation and visual testing

## Contributing

When adding new components:

1. Place them in the appropriate directory (form/, layout/, or common/)
2. Use TypeScript with proper type definitions
3. Follow the existing naming conventions
4. Include proper prop documentation
5. Export from `index.ts` for easy importing
6. Update this README with component documentation
7. Ensure accessibility standards are met
8. Add responsive design considerations
