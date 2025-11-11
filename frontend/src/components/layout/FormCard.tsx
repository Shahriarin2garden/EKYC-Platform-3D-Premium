import React from 'react';

interface FormCardProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const FormCard: React.FC<FormCardProps> = ({ children, onSubmit }) => {
  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100 transform transition-all duration-300 hover:shadow-3xl">
      <form onSubmit={onSubmit} className="space-y-6">
        {children}
      </form>
    </div>
  );
};

export default FormCard;
