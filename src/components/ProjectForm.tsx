import React, { useState, useEffect } from 'react';
import { Project } from './ProjectCard'; // Assuming Project type is exported from ProjectCard.tsx

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Omit<Project, 'id' | 'pps' | 'accumulatedProfit' | 'isRunning' | 'startTime'>, currentProject?: Project) => void;
  projectToEdit?: Project;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ isOpen, onClose, onSave, projectToEdit }) => {
  const [name, setName] = useState('');
  const [profitAmount, setProfitAmount] = useState<number | ''>('');
  const [profitCycleValue, setProfitCycleValue] = useState<number | ''>('');
  const [profitCycleUnit, setProfitCycleUnit] = useState<'hours' | 'days' | 'weeks' | 'months' | 'years'>('days');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectToEdit) {
      setName(projectToEdit.name);
      setProfitAmount(projectToEdit.profitAmount);
      setProfitCycleValue(projectToEdit.profitCycleValue);
      setProfitCycleUnit(projectToEdit.profitCycleUnit);
    } else {
      // Reset form when opening for a new project
      setName('');
      setProfitAmount('');
      setProfitCycleValue('');
      setProfitCycleUnit('days');
    }
    setError(null); // Clear errors when form opens or projectToEdit changes
  }, [isOpen, projectToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('项目名称不能为空');
      return;
    }
    if (profitAmount === '' || profitAmount <= 0) {
      setError('利润额必须是大于0的数字');
      return;
    }
    if (profitCycleValue === '' || profitCycleValue <= 0) {
      setError('利润周期值必须是大于0的数字');
      return;
    }
    setError(null);
    onSave({ 
      name: name.trim(), 
      profitAmount: Number(profitAmount), 
      profitCycleValue: Number(profitCycleValue), 
      profitCycleUnit 
    }, projectToEdit);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">{projectToEdit ? '编辑生意项目' : '添加新生意项目'}</h2>
        {error && <p className="text-red-500 bg-red-100 p-3 rounded mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">项目名称</label>
            <input 
              type="text" 
              id="projectName" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="例如：我的咖啡店"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="profitAmount" className="block text-sm font-medium text-gray-700 mb-1">利润额</label>
            <input 
              type="number" 
              id="profitAmount" 
              value={profitAmount} 
              onChange={(e) => setProfitAmount(e.target.value === '' ? '' : Number(e.target.value))} 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="例如：1000"
              min="0.01"
              step="0.01"
              required
            />
          </div>
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="profitCycleValue" className="block text-sm font-medium text-gray-700 mb-1">利润周期值</label>
              <input 
                type="number" 
                id="profitCycleValue" 
                value={profitCycleValue} 
                onChange={(e) => setProfitCycleValue(e.target.value === '' ? '' : Number(e.target.value))} 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="例如：24"
                min="1"
                step="1"
                required
              />
            </div>
            <div>
              <label htmlFor="profitCycleUnit" className="block text-sm font-medium text-gray-700 mb-1">利润周期单位</label>
              <select 
                id="profitCycleUnit" 
                value={profitCycleUnit} 
                onChange={(e) => setProfitCycleUnit(e.target.value as typeof profitCycleUnit)} 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              >
                <option value="hours">小时</option>
                <option value="days">天</option>
                <option value="weeks">周</option>
                <option value="months">月</option>
                <option value="years">年</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300"
            >
              取消
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {projectToEdit ? '保存更改' : '添加项目'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;

