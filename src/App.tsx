import React, { useState, useEffect, useCallback } from 'react';
import './App.css'; // Assuming basic styles are in App.css
import ProjectCard, { Project } from './components/ProjectCard';
import ProjectForm from './components/ProjectForm';
import { v4 as uuidv4 } from 'uuid';

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | undefined>(undefined);
  const [totalAccumulatedProfit, setTotalAccumulatedProfit] = useState(0);

  // Load projects from localStorage on initial render
  useEffect(() => {
    const storedProjects = localStorage.getItem('profitPulseProjects');
    if (storedProjects) {
      const parsedProjects: Project[] = JSON.parse(storedProjects);
      // Recalculate accumulated profit for projects that were running when app was closed
      const updatedProjects = parsedProjects.map(p => {
        if (p.isRunning && p.startTime) {
          const currentTime = Date.now();
          const elapsedTimeInSeconds = (currentTime - p.startTime) / 1000;
          p.accumulatedProfit += elapsedTimeInSeconds * p.pps;
          p.startTime = currentTime; // Update startTime for ongoing calculation
        }
        return p;
      });
      setProjects(updatedProjects);
    }
  }, []);

  // Save projects to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('profitPulseProjects', JSON.stringify(projects));
  }, [projects]);

  const calculatePPS = (profitAmount: number, profitCycleValue: number, profitCycleUnit: 'hours' | 'days' | 'weeks' | 'months' | 'years'): number => {
    let secondsInCycle = 0;
    switch (profitCycleUnit) {
      case 'hours':
        secondsInCycle = profitCycleValue * 60 * 60;
        break;
      case 'days':
        secondsInCycle = profitCycleValue * 24 * 60 * 60;
        break;
      case 'weeks':
        secondsInCycle = profitCycleValue * 7 * 24 * 60 * 60;
        break;
      case 'months': // Approximation: 30 days per month
        secondsInCycle = profitCycleValue * 30 * 24 * 60 * 60;
        break;
      case 'years': // Approximation: 365 days per year
        secondsInCycle = profitCycleValue * 365 * 24 * 60 * 60;
        break;
      default:
        return 0;
    }
    return secondsInCycle > 0 ? profitAmount / secondsInCycle : 0;
  };

  const handleSaveProject = useCallback((newProjectData: Omit<Project, 'id' | 'pps' | 'accumulatedProfit' | 'isRunning' | 'startTime'>, currentProject?: Project) => {
    const pps = calculatePPS(newProjectData.profitAmount, newProjectData.profitCycleValue, newProjectData.profitCycleUnit);
    if (currentProject) {
      // Editing existing project
      setProjects(prevProjects => 
        prevProjects.map(p => 
          p.id === currentProject.id 
            ? { 
                ...currentProject, 
                ...newProjectData, 
                pps, 
                // Optionally reset accumulatedProfit or adjust based on new PPS - PRD: "累计利润不清零，而是基于新的PPS继续计算"
                // For simplicity, if PPS changes, startTime should be reset if running to reflect new rate from now on.
                startTime: p.isRunning ? Date.now() : p.startTime 
              } 
            : p
        )
      );
    } else {
      // Adding new project
      const newProject: Project = {
        ...newProjectData,
        id: uuidv4(),
        pps,
        accumulatedProfit: 0,
        isRunning: true, // New projects start running by default
        startTime: Date.now(),
      };
      setProjects(prevProjects => [...prevProjects, newProject]);
    }
    setIsFormOpen(false);
    setProjectToEdit(undefined);
  }, []);

  const handleAddProjectClick = () => {
    setProjectToEdit(undefined);
    setIsFormOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setProjectToEdit(project);
    setIsFormOpen(true);
  };

  const handleDeleteProject = (id: string) => {
    if (window.confirm('确定要删除这个生意项目吗？')) {
      setProjects(prevProjects => prevProjects.filter(p => p.id !== id));
    }
  };

  const handleTogglePauseProject = (id: string) => {
    setProjects(prevProjects =>
      prevProjects.map(p => {
        if (p.id === id) {
          const now = Date.now();
          if (p.isRunning) {
            // Pausing
            const elapsedTimeInSeconds = p.startTime ? (now - p.startTime) / 1000 : 0;
            return {
              ...p,
              isRunning: false,
              accumulatedProfit: p.accumulatedProfit + (elapsedTimeInSeconds * p.pps),
              startTime: undefined, // Clear startTime when paused
            };
          } else {
            // Starting/Resuming
            return {
              ...p,
              isRunning: true,
              startTime: now, // Set startTime when resuming
            };
          }
        }
        return p;
      })
    );
  };

  // Real-time profit accumulation effect
  useEffect(() => {
    const interval = setInterval(() => {
      let currentTotalProfit = 0;
      setProjects(prevProjects => 
        prevProjects.map(p => {
          if (p.isRunning && p.startTime) {
            const currentTime = Date.now();
            const elapsedTimeSinceLastTick = (currentTime - p.startTime) / 1000; // Time since last update or start
            const profitThisTick = elapsedTimeSinceLastTick * p.pps;
            
            const updatedProject = {
              ...p,
              accumulatedProfit: p.accumulatedProfit + profitThisTick,
              startTime: currentTime, // Reset startTime for the next tick calculation
            };
            currentTotalProfit += updatedProject.accumulatedProfit;
            return updatedProject;
          }
          if (p.isRunning === false) { // Add already accumulated profit for paused projects
             currentTotalProfit += p.accumulatedProfit;
          }
          return p;
        })
      );
      setTotalAccumulatedProfit(currentTotalProfit);
    }, 1000); // Update every second

    return () => clearInterval(interval); // Cleanup on unmount
  }, [projects]); // Rerun when projects array changes (e.g. add/delete)
  
  // Calculate total accumulated profit (this will be slightly delayed from the individual updates)
  // A more robust way is to sum up from the projects state directly after it's updated.
  useEffect(() => {
    const total = projects.reduce((sum, p) => sum + p.accumulatedProfit, 0);
    setTotalAccumulatedProfit(total);
  }, [projects]);


  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-indigo-600">利润追踪器 (ProfitPulse)</h1>
      </header>

      <div className="bg-white shadow-lg rounded-xl p-6 mb-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">总累计利润</h2>
        <p className="text-4xl font-bold text-green-500">¥{totalAccumulatedProfit.toFixed(2)}</p>
      </div>

      <div className="text-center mb-8">
        <button 
          onClick={handleAddProjectClick} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out"
        >
          + 添加新生意项目
        </button>
      </div>

      <div className="max-w-4xl mx-auto">
        {projects.length === 0 && (
          <p className="text-center text-gray-500 text-lg">还没有生意项目，点击上方按钮添加一个吧！</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onTogglePause={handleTogglePauseProject} 
              onEdit={handleEditProject}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      </div>

      <ProjectForm 
        isOpen={isFormOpen} 
        onClose={() => {
          setIsFormOpen(false);
          setProjectToEdit(undefined);
        }} 
        onSave={handleSaveProject} 
        projectToEdit={projectToEdit} 
      />
    </div>
  );
}

export default App;

