"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// A sample data structure representing the workflow
const sampleWorkflow = [
  { id: '1', name: 'API A', type: 'current', cost: '$10', efficiency: 'Moderate' },
  { id: '2', name: 'API B', type: 'alternative', cost: '$8', efficiency: 'Optimized' },
  { id: '3', name: 'API C', type: 'alternative', cost: '$15', efficiency: 'High Cost' },
];

interface WorkflowNode {
  id: string;
  name: string;
  type: string;
  cost: string;
  efficiency: string;
}

const WorkflowVisualizer = ({ workflowData = sampleWorkflow }: { workflowData?: WorkflowNode[] }) => {
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [selectedGhostNode, setSelectedGhostNode] = useState<WorkflowNode | null>(null);

  const handleNodeClick = (node: WorkflowNode) => {
    if (selectedNode && selectedNode.id === node.id) {
      setSelectedNode(null);
      setSelectedGhostNode(null);
    } else {
      setSelectedNode(node);
      setSelectedGhostNode(null);
    }
  };

  const handleGhostNodeClick = (node: WorkflowNode) => {
    setSelectedGhostNode(node);
  };

  const renderNodeDetails = (node: WorkflowNode) => (
    <div>
      <h3 className="text-xl font-semibold mb-4">Node Details: {node.name}</h3>
      <p className="mb-2">Cost: {node.cost}</p>
      <p className="mb-2">Efficiency: {node.efficiency}</p>
      <p className="mb-2">API Calls: 1,234 / month</p>
      <p className="mb-2">Response Time: 250ms</p>
      <p className="mb-2">Error Rate: 0.5%</p>
      <p className="mb-2">Data Processed: 500 MB / day</p>
      <p className="mb-4">Last Updated: 2 hours ago</p>
    </div>
  );

  const renderGhostNodes = (node: WorkflowNode) => {
    const ghostNodes = workflowData.filter(
      (data) => data.type === 'alternative' && data.id !== node.id
    );
    return (
      <motion.div 
        className="flex justify-center items-center gap-8 mt-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
        {ghostNodes.map((ghostNode, index) => (
          <React.Fragment key={ghostNode.id}>
            {index === 0 && (
              <motion.div 
                className="flex items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-16 h-0.5 bg-gray-300" />
              </motion.div>
            )}
            <motion.div
              className={`p-4 border rounded-lg shadow-md bg-gray-100 text-center cursor-pointer transition-all duration-300
                ${selectedGhostNode?.id === ghostNode.id 
                  ? 'opacity-100 ring-2 ring-blue-400 ring-opacity-50 bg-blue-50 scale-105' 
                  : 'opacity-70'
                }
              `}
              initial={{ scale: 0.8 }}
              animate={{ 
                scale: selectedGhostNode?.id === ghostNode.id ? 1.05 : 1,
                opacity: selectedGhostNode?.id === ghostNode.id ? 1 : 0.7
              }}
              exit={{ scale: 0.8, opacity: 0 }}
              whileHover={{ 
                scale: selectedGhostNode?.id === ghostNode.id ? 1.05 : 1.05, 
                opacity: 1, 
                boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)' 
              }}
              transition={{ duration: 0.3 }}
              onClick={() => handleGhostNodeClick(ghostNode)}
            >
              <h3 className="text-lg font-semibold mb-2">{ghostNode.name}</h3>
              <p>Cost: {ghostNode.cost}</p>
              <p>Efficiency: {ghostNode.efficiency}</p>
            </motion.div>
            {index === 0 && (
              <motion.div 
                className="flex items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-16 h-0.5 bg-gray-300" />
              </motion.div>
            )}
          </React.Fragment>
        ))}
      </motion.div>
    );
  };

  return (
    <div className="p-8 w-full mx-auto" style={{ minHeight: `${workflowData.length * 200 + 100}px` }}>
      <h2 className="text-3xl font-bold text-center mb-8">Workflow Visualization</h2>
      <div className="flex flex-col items-center gap-4">
        {workflowData.map((node, index) => (
          <React.Fragment key={node.id}>
            <motion.div
              className={`p-6 border rounded-lg shadow-md cursor-pointer w-64 ${
                node.type === 'current' ? 'bg-green-100' : 'bg-yellow-100'
              }`}
              whileHover={{ scale: 1.05 }}
              onClick={() => handleNodeClick(node)}
            >
              <h3 className="text-xl font-semibold mb-2">{node.name}</h3>
              <p>Cost: {node.cost}</p>
              <p>Efficiency: {node.efficiency}</p>
            </motion.div>
            <AnimatePresence>
              {selectedNode && selectedNode.id === node.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full"
                >
                  {renderGhostNodes(node)}
                  <motion.div 
                    className="mt-8 p-6 border rounded-lg shadow-md bg-white"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <div className="flex gap-8">
                      <div className="w-1/2">
                        {renderNodeDetails(selectedNode)}
                      </div>
                      <div className={`w-1/2 p-4 rounded-lg transition-all duration-300
                        ${selectedGhostNode ? 'bg-blue-50 shadow-lg ring-2 ring-blue-400 ring-opacity-50' : ''}
                      `}>
                        {selectedGhostNode ? renderNodeDetails(selectedGhostNode) : renderNodeDetails(workflowData.find(n => n.type === 'alternative' && n.id !== selectedNode.id) || selectedNode)}
                      </div>
                    </div>
                    <div className="mt-8 bg-gray-100 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Optimization Suggestions:</h3>
                      <ul className="list-disc list-inside">
                        <li>Implement caching to reduce API calls</li>
                        <li>Optimize query parameters for faster response times</li>
                        <li>Consider bulk operations for data processing efficiency</li>
                      </ul>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            {index < workflowData.length - 1 && (
              <div className="h-8 w-0.5 bg-gray-300 relative">
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-0 h-0 border-l-8 border-l-transparent border-t-8 border-t-gray-300 border-r-8 border-r-transparent" />
              </div>
            )}
          </React.Fragment>
        ))}
        <motion.div
          className="p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer w-64 flex items-center justify-center"
          whileHover={{ scale: 1.05 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </motion.div>
      </div>
    </div>
  );
};

export default WorkflowVisualizer;
