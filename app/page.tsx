'use client'
import Image from 'next/image'
import abacus from "./assets/abacus.png"
import WorkflowVisualizer from './components/WorkflowVisualizer'
import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [workflowData, setWorkflowData] = useState([]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;
  
    const formData = new FormData();
    formData.append('screenshot', file);
  
    try {
      const response = await fetch('http://localhost:5001/api/upload-screenshot', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      const extractedWorkflow = data.actions.map((action: any, index: number) => ({
        id: (index + 1).toString(),
        name: action.app,
        type: index === 0 ? 'current' : 'alternative',
        cost: '$10', // You might want to replace this with actual data
        efficiency: 'Moderate', // You might want to replace this with actual data
      }));
      setWorkflowData(extractedWorkflow);
    } catch (error) {
      console.error('Error:', error);
    }
  };


  
  return (
    <div className="flex flex-col items-center justify-between min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-inter)] bg-white text-gray-800">
      {/* Header */}
      <header className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Welcome to APIcus</h1>
        <p className="mt-4 text-lg sm:text-xl">Optimize and analyze your workflow automation services efficiently and effortlessly.</p>
      </header>
      
      {/* Main Content */}
      <main className="flex flex-col gap-8 items-center w-full max-w-4xl">
        <Image
          className="mt-8"
          src={abacus}
          alt="APIcus Logo"
          width={180}
          height={38}
          priority
        />

        

        <section className="text-center sm:text-left w-full">
          <h2 className="text-2xl font-semibold mb-4">Get Started with APIcus</h2>
          <ol className="list-inside list-decimal text-sm sm:text-base font-[family-name:var(--font-mono)] mb-6">
            <li className="mb-2">
              Import your workflow screenshot or connect your automation tool to get started.
            </li>
            <li>See real-time analytics and recommendations instantly.</li>
          </ol>

          {/* Import Screenshot Form */}
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="screenshot" className="block text-sm font-medium text-gray-700 mb-2">
                Upload Your Workflow Screenshot
              </label>
              <input
                type="file"
                id="screenshot"
                name="screenshot"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Analyze Workflow
            </button>
          </form>
        </section>
        {/* WorkflowVisualizer Component */}
        <div className="w-full bg-gray-50 rounded-lg shadow-md p-6">
          <WorkflowVisualizer workflowData={workflowData} />
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-600 mt-16">
        <p>&copy; {new Date().getFullYear()} APIcus. All rights reserved.</p>
      </footer>
    </div>
  );
}
