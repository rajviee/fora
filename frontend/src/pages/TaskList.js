import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api';
import { getStatusColor, getPriorityColor, formatDate } from '../utils';

export default function TaskList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tasks, setTasks] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const isSelf = searchParams.get('self') === 'true';
  const statusFilter = searchParams.get('status') || '';
  const page = parseInt(searchParams.get('page') || '0');

  useEffect(() => { loadTasks(); }, [isSelf, statusFilter, page]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const params = { isSelfTask: isSelf, perPage: 15, page };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const res = await api.get('/task/getTaskList', { params });
      setTasks(res.data.tasks || []);
      setTotal(res.data.totalTasks || 0);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const statuses = ['', 'Pending', 'In Progress', 'Completed', 'Overdue'];

  return (
    <div className="animate-fade-in" data-testid="task-list-page">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-primary">Tasks</h1>
        <Link to="/tasks/create" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors inline-flex items-center" data-testid="create-task-link">
          <i className="fa-solid fa-plus mr-2" />New Task
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button onClick={() => setSearchParams({ self: 'false' })} className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm rounded-md font-medium transition-colors ${!isSelf ? 'bg-primary text-white shadow-sm' : 'text-gray-500'}`} data-testid="filter-team">Team</button>
            <button onClick={() => setSearchParams({ self: 'true' })} className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm rounded-md font-medium transition-colors ${isSelf ? 'bg-primary text-white shadow-sm' : 'text-gray-500'}`} data-testid="filter-self">Self</button>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {statuses.map(s => (
              <button
                key={s || 'all'}
                onClick={() => { const p = new URLSearchParams(searchParams); if (s) p.set('status', s); else p.delete('status'); p.delete('page'); setSearchParams(p); }}
                className={`px-3 py-1 text-xs rounded-full border font-medium transition-colors ${statusFilter === s ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-primary/50'}`}
                data-testid={`filter-status-${(s || 'all').toLowerCase().replace(/ /g, '-')}`}
              >{s || 'All'}</button>
            ))}
          </div>
          <div className="flex-1 min-w-[180px]">
            <div className="relative">
              <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && loadTasks()}
                placeholder="Search tasks..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                data-testid="task-search"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100" data-testid="task-table">
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <i className="fa-solid fa-clipboard-list text-4xl mb-3" />
            <p className="text-sm">No tasks found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px]">
              <thead>
                <tr className="bg-primary text-white text-sm">
                  <th className="py-3 px-4 sm:px-5 text-left font-medium w-8"><input type="checkbox" className="rounded border-white/30" /></th>
                  <th className="py-3 px-4 text-left font-medium">Task Name</th>
                  <th className="py-3 px-4 text-left font-medium">Doer</th>
                  <th className="py-3 px-4 text-left font-medium">Priority</th>
                  <th className="py-3 px-4 text-left font-medium">Deadline</th>
                  <th className="py-3 px-4 sm:px-5 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, idx) => (
                  <tr key={task._id} className={`border-b border-gray-50 hover:bg-primary/5 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/50' : ''}`} data-testid={`task-row-${task._id}`}>
                    <td className="py-3 px-4 sm:px-5"><input type="checkbox" className="rounded border-gray-300" /></td>
                    <td className="py-3 px-4">
                      <Link to={`/tasks/${task._id}`} className="text-sm text-secondary hover:text-primary font-medium truncate block max-w-[200px] sm:max-w-[300px]">
                        {task.title}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-7 h-7 rounded-full bg-primary-50 flex items-center justify-center text-[10px] font-semibold text-primary">
                          {task.assignees?.[0]?.firstName?.[0] || '?'}
                        </div>
                        {task.assignees?.length > 1 && <span className="text-xs text-gray-400">+{task.assignees.length - 1}</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2.5 py-1 rounded font-medium ${
                        task.priority === 'High' ? 'bg-primary text-white' :
                        task.priority === 'Medium' ? 'bg-primary-50 text-primary' :
                        'bg-gray-100 text-gray-600'
                      }`}>{task.priority}</span>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500">
                      <i className="fa-regular fa-clock mr-1" />{formatDate(task.dueDateTime)}
                    </td>
                    <td className="py-3 px-4 sm:px-5">
                      <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${getStatusColor(task.status)}`}>{task.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > 15 && (
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-t border-gray-100">
            <button disabled={page === 0} onClick={() => { const p = new URLSearchParams(searchParams); p.set('page', String(page - 1)); setSearchParams(p); }} className="text-sm text-primary disabled:text-gray-300 font-medium">
              <i className="fa-solid fa-chevron-left mr-1" />Previous
            </button>
            <span className="text-sm text-gray-500">Page {page + 1} of {Math.ceil(total / 15)}</span>
            <button disabled={(page + 1) * 15 >= total} onClick={() => { const p = new URLSearchParams(searchParams); p.set('page', String(page + 1)); setSearchParams(p); }} className="text-sm text-primary disabled:text-gray-300 font-medium">
              Next<i className="fa-solid fa-chevron-right ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
