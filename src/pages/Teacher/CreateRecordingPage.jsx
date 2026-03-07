import React from 'react';
import { useNavigate } from 'react-router-dom';
import CreateLessonModal from '../../components/UI/CreateLessonModal.jsx';

const CreateRecordingPage = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/teacher/recordings');
  };

  const handleSuccess = () => {
    // Modal already closes itself after success; no extra action needed.
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex items-center justify-center p-4">
      <CreateLessonModal onClose={handleClose} onSuccess={handleSuccess} />
    </div>
  );
};

export default CreateRecordingPage;