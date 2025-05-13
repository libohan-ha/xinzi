import React from 'react';

interface Project {
  id: string;
  name: string;
  profitAmount: number;
  profitCycleValue: number;
  profitCycleUnit: 'hours' | 'days' | 'weeks' | 'months' | 'years';
  pps: number;
  accumulatedProfit: number;
  isRunning: boolean;
  startTime?: number; // Timestamp when project was last started/resumed
}

interface ProjectCardProps {
  project: Project;
  onTogglePause: (id: string) => void;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onTogglePause, onEdit, onDelete }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-semibold text-gray-800">{project.name}</h3>
        <div className="flex space-x-2">
          <button 
            onClick={() => onEdit(project)} 
            className="text-sm bg-blue-500 hover:bg-blue-700 text-white py-1 px-3 rounded"
          >
            编辑
          </button>
          <button 
            onClick={() => onDelete(project.id)} 
            className="text-sm bg-red-500 hover:bg-red-700 text-white py-1 px-3 rounded"
          >
            删除
          </button>
        </div>
      </div>
      <div className="mb-2">
        <p className="text-gray-600">累计利润: <span className="font-bold text-green-600">¥{project.accumulatedProfit.toFixed(2)}</span></p>
        <p className="text-gray-600">每秒利润 (PPS): <span className="font-bold">¥{project.pps.toFixed(4)}</span></p>
      </div>
      <button 
        onClick={() => onTogglePause(project.id)}
        className={`w-full py-2 px-4 rounded font-semibold text-white ${project.isRunning ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}`}
      >
        {project.isRunning ? '暂停追踪' : '启动追踪'}
      </button>
    </div>
  );
};

export default ProjectCard;
export type { Project }; // Exporting Project type for use in other components

