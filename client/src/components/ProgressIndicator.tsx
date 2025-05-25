import React from 'react';

export type ProgressStage = 
  | 'connecting'   // 0-15%
  | 'generating'   // 15-50%
  | 'saving'       // 50-75% 
  | 'publishing'   // 75-90%
  | 'completed'    // 100%
  | 'failed'       // error state
  | 'idle';        // not running

interface ProgressIndicatorProps {
  progress: number;
  statusStage: ProgressStage;
  errorMessage?: string | null;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ 
  progress, 
  statusStage,
  errorMessage 
}) => {
  if (statusStage === 'idle' && progress === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="w-full bg-neutral-100 rounded-full h-6 overflow-hidden">
        <div 
          className="bg-primary-500 h-full transition-all duration-300 rounded-full" 
          style={{ width: `${progress}%` }} 
          role="progressbar" 
          aria-valuenow={progress} 
          aria-valuemin={0} 
          aria-valuemax={100}
        ></div>
      </div>
      <p className="text-sm mt-1 font-medium" style={{ color: statusStage === 'failed' ? '#e11d48' : '#6b7280' }}>
        {statusStage === 'connecting' && 'Attempting to connect to OpenAI...'}
        {statusStage === 'generating' && 'Generating images with OpenAI...'}
        {statusStage === 'saving' && 'Saving images to Dropbox...'}
        {statusStage === 'publishing' && 'Publishing images to WordPress...'}
        {statusStage === 'completed' && 'Task completed successfully.'}
        {statusStage === 'failed' && `Task failed${errorMessage ? `: ${errorMessage}` : '.'}`}
      </p>
    </div>
  );
};

export default ProgressIndicator;