import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import axios from '../lib/axios';

export default function AdminPanel() {
  const [newLanguage, setNewLanguage] = useState({ name: '', code: '' });

  const { data: languages, refetch: refetchLanguages } = useQuery({
    queryKey: ['languages'],
    queryFn: async () => {
      const { data } = await axios.get('/api/languages');
      return data;
    },
  });

  const { data: interpreters } = useQuery({
    queryKey: ['interpreters'],
    queryFn: async () => {
      const { data } = await axios.get('/api/interpreters');
      return data;
    },
  });

  const addLanguageMutation = useMutation({
    mutationFn: async (languageData: typeof newLanguage) => {
      const response = await axios.post('/api/languages', languageData);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Language added successfully!');
      setNewLanguage({ name: '', code: '' });
      refetchLanguages();
    },
    onError: () => {
      toast.error('Failed to add language');
    },
  });

  const toggleLanguageStatus = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await axios.patch(`/api/languages/${id}`, { isActive });
      return response.data;
    },
    onSuccess: () => {
      refetchLanguages();
    },
  });

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Languages Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Manage Languages</h2>
          
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addLanguageMutation.mutate(newLanguage);
            }}
            className="mb-6 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">Language Name</label>
              <input
                type="text"
                value={newLanguage.name}
                onChange={(e) => setNewLanguage(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Language Code</label>
              <input
                type="text"
                value={newLanguage.code}
                onChange={(e) => setNewLanguage(prev => ({ ...prev, code: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={addLanguageMutation.isPending}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
            >
              {addLanguageMutation.isPending ? 'Adding...' : 'Add Language'}
            </button>
          </form>

          <div className="space-y-2">
            {languages?.map((language: any) => (
              <div key={language._id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span>{language.name} ({language.code})</span>
                <button
                  onClick={() => toggleLanguageStatus.mutate({
                    id: language._id,
                    isActive: !language.isActive
                  })}
                  className={`px-3 py-1 rounded ${
                    language.isActive
                      ? 'bg-red-100 text-red-800 hover:bg-red-200'
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}
                >
                  {language.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Interpreters Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Interpreters</h2>
          <div className="space-y-4">
            {interpreters?.map((interpreter: any) => (
              <div key={interpreter._id} className="p-4 bg-gray-50 rounded">
                <h3 className="font-medium">{interpreter.name}</h3>
                <p className="text-sm text-gray-600">{interpreter.email}</p>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">Languages:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {interpreter.languages.map((lang: any) => (
                      <span
                        key={lang._id}
                        className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded"
                      >
                        {lang.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}