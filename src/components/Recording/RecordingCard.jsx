import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Play, Calendar, Clock, Users, Eye, Youtube } from 'lucide-react';
import { format } from 'date-fns';

const LessonCard = ({ lesson, isTeacher = false }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';

  const handleClick = () => {
    navigate(`/lesson/${lesson.id}`);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '--:--';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-blue-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
        {lesson.thumbnailUrl ? (
          <img
            src={lesson.thumbnailUrl}
            alt={lesson.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-500 to-red-600">
            <Youtube size={48} className="text-white" />
          </div>
        )}

        {/* Duration badge */}
        {lesson.duration > 0 && (
          <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs font-medium">
            {formatDuration(lesson.duration)}
          </div>
        )}

        {/* Status badge (teacher view) */}
        {isTeacher && !lesson.isPublished && (
          <div className="absolute top-2 left-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor('draft')}`}>
              Draft
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2 line-clamp-2">
          {lesson.title}
        </h3>

        {lesson.description && (
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
            {lesson.description}
          </p>
        )}

        {/* Metadata */}
        <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            <Calendar size={16} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
            <span>{format(new Date(lesson.createdAt), 'PPP', { locale: i18n.language })}</span>
          </div>

          <div className="flex items-center">
            <Users size={16} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
            <span>{lesson.instructorName || 'Unknown'}</span>
          </div>

          {lesson.views !== undefined && (
            <div className="flex items-center">
              <Eye size={16} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
              <span>{lesson.views} views</span>
            </div>
          )}

          {lesson.isFree && (
            <span className="inline-block mt-2 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded-full">
              Free preview
            </span>
          )}
        </div>

        {/* Teacher actions */}
        {isTeacher && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex space-x-2 rtl:space-x-reverse">
            {!lesson.isPublished && (
              <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                Draft
              </span>
            )}
            {lesson.visibility === 'public' && (
              <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                Public
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonCard;