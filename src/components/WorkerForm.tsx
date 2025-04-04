import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { useStore } from '../store';

export function WorkerForm() {
  const [name, setName] = useState('');
  const [skills, setSkills] = useState('');
  const addWorker = useStore((state) => state.addWorker);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addWorker({
      name,
      skills: skills.split(',').map((s) => s.trim()),
      availability: {},
    });
    setName('');
    setSkills('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <UserPlus className="w-5 h-5" />
        Add New Worker
      </h2>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
          Skills (comma-separated)
        </label>
        <input
          type="text"
          id="skills"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Add Worker
      </button>
    </form>
  );
}