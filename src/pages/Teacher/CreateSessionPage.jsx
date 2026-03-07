import React from 'react';
import { useNavigate } from 'react-router-dom';
import CreateSessionModal from '../../components/Session/CreateSessionModal.jsx';

const CreateSessionPage = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/teacher/sessions');
  };

  const handleSuccess = (data) => {
    console.log('Session created', data);
    // Modal already calls onClose after success, so no extra navigation needed
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex items-center justify-center p-4">
      <CreateSessionModal onClose={handleClose} onSuccess={handleSuccess} />
    </div>
  );
};

export default CreateSessionPage;