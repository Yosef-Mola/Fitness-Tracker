import { useState } from 'react';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [authView, setAuthView] = useState('login'); // 'login' | 'register'

  const [targets, setTargets] = useState([]);
  const [threshold, setThreshold] = useState('1.25');

  const [history, setHistory] = useState([]);
  const [resultMessage, setResultMessage] = useState(null);
  const [resultType, setResultType] = useState('');

  const [routines, setRoutines] = useState([]);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [routineExercises, setRoutineExercises] = useState([]);
  const [newRoutineName, setNewRoutineName] = useState('');
  const [rTarget, setRTarget] = useState('');
  const [rWeight, setRWeight] = useState('');
  const [rSets, setRSets] = useState('');
  const [rReps, setRReps] = useState('');

  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [showAddExercise, setShowAddExercise] = useState(false);

  const isRecentlyUpdated = (dateString) => {
    if (!dateString) return false;
    const modifiedDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today - modifiedDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 14;
  };

  const isSelectedExerciseInRoutine = selectedRoutine && routineExercises.some(
    ex => ex.exercise.id.toString() === rTarget.toString()
  );

  const [weeklyGoal, setWeeklyGoal] = useState(() => {
    return parseInt(localStorage.getItem('weeklyGoal')) || 3;
  });

  const handleGoalChange = (e) => {
    const val = parseInt(e.target.value);
    setWeeklyGoal(val);
    localStorage.setItem('weeklyGoal', val);
  };

  const daysList = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const displayLabel = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
    daysList.push({ dateString, displayLabel });
  }

  const achieved14Days = daysList.filter(dayObj => history.some(log => log?.date === dayObj.dateString)).length;
  const target14Days = weeklyGoal * 2;
  const isGoalMet = achieved14Days >= target14Days;

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:8080/api/auth/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`, { method: 'POST' });
      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
        setThreshold(user?.customThresholdPercentage || 1.25);
        fetchTargets();
        fetchHistory(user?.id);
        fetchRoutines(user?.id);
      } else { alert("Invalid username or password"); }
    } catch (err) { console.error(err); alert("Error connecting to server"); }
  };

  // Register handler
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username || !password) { alert("Please enter username and password."); return; }
    try {
      const res = await fetch(`http://localhost:8080/api/auth/register?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`, { method: 'POST' });
      if (res.ok) {
        alert("Account created successfully! Please log in.");
        setAuthView('login');
      } else {
        alert("Username already exists or error occurred.");
      }
    } catch (err) { console.error(err); }
  };

  const fetchTargets = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/workouts/targets');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setTargets(data);
        if (!rTarget) setRTarget(data[0].id);
      }
    } catch (err) { console.error(err); }
  };

  const fetchHistory = async (userId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/workouts/history?userId=${userId}`);
      const data = await res.json();
      if (Array.isArray(data)) setHistory(data);
    } catch (err) { console.error(err); }
  };

  const handleCreateExercise = async (e) => {
    e.preventDefault();
    if (!newExerciseName) return;
    try {
      const res = await fetch(`http://localhost:8080/api/workouts/targets?name=${encodeURIComponent(newExerciseName)}`, { method: 'POST' });
      if (res.ok) {
        const created = await res.json();
        setNewExerciseName('');
        setShowAddExercise(false);
        fetchTargets();
        setRTarget(created.id);
      }
    } catch (err) { console.error(err); }
  };

  const fetchRoutines = async (userId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/workouts/routines?userId=${userId}`);
      const data = await res.json();
      setRoutines(data);
      if (data.length > 0) {
        handleSelectRoutine(data[0]);
      } else {
        setSelectedRoutine(null);
        setRoutineExercises([]);
      }
    } catch (err) { console.error(err); }
  };

  const handleSelectRoutine = async (routine) => {
    if (!routine) return;
    setSelectedRoutine(routine);
    try {
      const res = await fetch(`http://localhost:8080/api/workouts/routines/exercises?routineId=${routine.id}`);
      const data = await res.json();
      setRoutineExercises(data);
    } catch (err) { console.error(err); }
  };

  const handleCreateRoutine = async (e) => {
    e.preventDefault();
    if (!newRoutineName) return;
    try {
      const res = await fetch(`http://localhost:8080/api/workouts/routines?userId=${currentUser.id}&name=${encodeURIComponent(newRoutineName)}`, { method: 'POST' });
      if (res.ok) {
        setNewRoutineName('');
        fetchRoutines(currentUser.id);
      }
    } catch (err) { console.error(err); }
  };

  const handleAddExerciseToRoutine = async (e) => {
    e.preventDefault();
    if (!selectedRoutine || !rTarget || !rWeight || !rSets || !rReps) return;
    try {
      const res = await fetch(`http://localhost:8080/api/workouts/routines/exercise?routineId=${selectedRoutine.id}&targetId=${rTarget}&weight=${rWeight}&sets=${rSets}&reps=${rReps}`, { method: 'POST' });
      if (res.ok) {
        handleSelectRoutine(selectedRoutine);
        setRWeight('');
        setRSets('');
        setRReps('');
      }
    } catch (err) { console.error(err); }
  };

  const handleEditExerciseClick = (ex) => {
    setRTarget(ex.exercise.id);
    setRWeight(ex.defaultWeight);
    setRSets(ex.defaultSets);
    setRReps(ex.defaultReps);
  };

  const handleLogRoutine = async () => {
    if (!selectedRoutine) return;
    try {
      const res = await fetch(`http://localhost:8080/api/workouts/routines/log?userId=${currentUser.id}&routineId=${selectedRoutine.id}&date=${logDate}`, { method: 'POST' });
      const msg = await res.text();

      if (msg.includes('WARNING')) {
        setResultMessage(msg);
        setResultType('error');
      } else {
        setResultMessage(null);
        setResultType('');
      }

      fetchHistory(currentUser.id);
    } catch (err) { console.error(err); }
  };

  const handleUpdateRule = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`http://localhost:8080/api/auth/rule?userId=${currentUser.id}&threshold=${threshold}`, { method: 'POST' });
      if (res.ok) {
        const updated = await res.json();
        setCurrentUser(updated);
        alert("Custom rule updated successfully!");
      }
    } catch (err) { alert("Failed to update rule"); }
  };

  const handleDeleteRoutine = async (routineId) => {
    if (!window.confirm("Are you sure you want to delete this ENTIRE routine?")) return;
    try {
      const res = await fetch(`http://localhost:8080/api/workouts/routines/${routineId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchRoutines(currentUser.id);
      }
    } catch (err) { console.error(err); }
  };

  const handleRemoveExercise = async (exerciseId) => {
    if (!window.confirm("Remove this exercise from the routine?")) return;
    try {
      const res = await fetch(`http://localhost:8080/api/workouts/routines/exercises/${exerciseId}`, { method: 'DELETE' });
      if (res.ok) {
        handleSelectRoutine(selectedRoutine);
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteLog = async (logId) => {
    if (!window.confirm("Are you sure you want to delete this workout log?")) return;
    try {
      const res = await fetch(`http://localhost:8080/api/workouts/history/${logId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchHistory(currentUser.id);
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-start p-6">
      <div className="max-w-4xl w-full space-y-6">

        {/* Header */}
        <div className="bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-700 text-center">
          <h1 className="text-3xl font-extrabold text-blue-400 tracking-wide">Fitness Tracker</h1>
        </div>

        {/* Auth Section */}
        {!currentUser ? (
          <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700 max-w-md mx-auto text-center space-y-6">

            {authView === 'login' && (
              <>
                <h2 className="text-2xl font-bold text-blue-300 tracking-tight">Login</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                  <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500" required />
                  <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500" required />
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition shadow-lg text-sm">Log in</button>
                </form>

                <div className="border-t border-slate-700 pt-6 space-y-3">
                  <p className="text-xs text-slate-400">Don't have an account?</p>
                  <button type="button" onClick={() => setAuthView('register')} className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-3 rounded-xl transition text-xs border border-slate-600">Create new account</button>
                </div>
              </>
            )}

            {authView === 'register' && (
              <>
                <h2 className="text-2xl font-bold text-blue-300 tracking-tight">Create New Account</h2>
                <form onSubmit={handleRegister} className="space-y-4">
                  <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500" required />
                  <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500" required />
                  <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl transition shadow-lg text-sm">Register</button>
                </form>

                <div className="border-t border-slate-700 pt-6">
                  <button onClick={() => setAuthView('login')} className="text-xs text-slate-400 hover:underline bg-transparent border-none cursor-pointer">Already have an account? Log in</button>
                </div>
              </>
            )}

          </div>
        ) : (
          <div className="bg-slate-800 rounded-2xl shadow-xl p-4 border border-slate-700 flex justify-between items-center text-xs">
            <span className="text-emerald-400 font-bold">Logged in as: {currentUser?.username}</span>
            <button onClick={() => setCurrentUser(null)} className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg">Logout</button>
          </div>
        )}

        {/* Dashboard Content */}
        {currentUser && (
          <div className="space-y-6">

            <div className="bg-slate-800 rounded-2xl shadow-xl p-4 border border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-sm font-semibold text-blue-300">Safety Rule Engine</h2>
                <p className="text-xs text-slate-400">Max weight jump threshold</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <select value={threshold} onChange={(e) => setThreshold(e.target.value)} className="flex-1 sm:w-40 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200">
                  <option value="1.10">10% (Strict)</option>
                  <option value="1.25">25% (Standard)</option>
                  <option value="1.40">40% (Aggressive)</option>
                </select>
                <button onClick={handleUpdateRule} className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-xs font-medium transition">Save</button>
              </div>
            </div>

            {/* ROUTINES MANAGER */}
            <div className="bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-700">
              <h2 className="text-lg font-semibold text-blue-300 mb-4">My Workout Routines</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-300 mb-2">1. Select or Create Routine</h3>
                    {routines.length > 0 && (
                      <div className="flex gap-2 mb-3">
                        <select
                          className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200"
                          value={selectedRoutine?.id || ''}
                          onChange={(e) => handleSelectRoutine(routines.find(r => r.id === parseInt(e.target.value)))}
                        >
                          {routines.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                        <button onClick={() => handleDeleteRoutine(selectedRoutine.id)} title="Delete Routine" className="bg-rose-600/20 text-rose-400 border border-rose-500/30 hover:bg-rose-600 hover:text-white px-3 py-2 rounded-lg transition text-xs font-medium">
                          🗑️
                        </button>
                      </div>
                    )}
                    <form onSubmit={handleCreateRoutine} className="flex gap-2 mb-4">
                      <input type="text" placeholder="New Routine (e.g. Legs Day)" value={newRoutineName} onChange={e => setNewRoutineName(e.target.value)} className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-2 py-1.5 text-xs text-slate-200" />
                      <button type="submit" className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg text-xs font-semibold">Create</button>
                    </form>
                  </div>

                  {selectedRoutine && (
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <label className="block text-xs font-medium text-slate-400 mb-1">Workout Date (Retroactive Logging):</label>
                      <input
                        type="date"
                        value={logDate}
                        onChange={(e) => setLogDate(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 mb-3 cursor-pointer"
                      />
                      <button onClick={handleLogRoutine} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition shadow-lg text-sm">
                        🚀 LOG ENTIRE ROUTINE NOW
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                  <h3 className="text-sm font-semibold text-slate-300 mb-2">
                    2. Edit: {selectedRoutine ? selectedRoutine.name : 'Select a routine first'}
                  </h3>

                  {selectedRoutine ? (
                    <>
                      <ul className="space-y-2 mb-4 max-h-40 overflow-y-auto pr-1">
                        {routineExercises.length === 0 && <span className="text-xs text-slate-500">No exercises yet. Add below.</span>}
                        {routineExercises.map(ex => (
                          <li key={ex.id} className="bg-slate-800 p-2.5 rounded-lg flex justify-between items-center text-xs border border-slate-700 group">
                            <div className="flex-1">
                              <span className="font-medium text-slate-200">
                                {ex.exercise.name}
                                <span className="text-slate-400 ml-1">
                                  ({ex.defaultSets} Sets, {ex.defaultReps} Reps, {ex.defaultWeight}kg)
                                </span>
                              </span>
                              {isRecentlyUpdated(ex.lastModifiedDate) && (
                                <span className="text-yellow-400 font-bold ml-2 bg-yellow-900/30 px-2 py-0.5 rounded flex-shrink-0" title={`Updated: ${ex.lastModifiedDate}`}>
                                  ⭐
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2 ml-2 opacity-70 group-hover:opacity-100 transition">
                              <button onClick={() => handleEditExerciseClick(ex)} title="Edit Exercise" className="text-blue-400 hover:text-blue-300">
                                ✏️
                              </button>
                              <button onClick={() => handleRemoveExercise(ex.id)} title="Remove Exercise" className="text-rose-400 hover:text-rose-300">
                                ❌
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>

                      <div className="pt-3 border-t border-slate-700">
                        {showAddExercise ? (
                          <form onSubmit={handleCreateExercise} className="flex gap-2 mb-3 bg-slate-800 p-2 rounded-lg border border-blue-500/50">
                            <input type="text" placeholder="Type new exercise name..." required value={newExerciseName} onChange={e => setNewExerciseName(e.target.value)} className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-2 py-1.5 text-xs text-slate-200" />
                            <button type="submit" className="bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg text-xs font-semibold">Save</button>
                            <button type="button" onClick={() => setShowAddExercise(false)} className="bg-slate-600 hover:bg-slate-500 px-2 py-1.5 rounded-lg text-xs font-semibold">Cancel</button>
                          </form>
                        ) : (
                          <div className="text-right mb-2">
                            <button type="button" onClick={() => setShowAddExercise(true)} className="text-[10px] text-blue-400 hover:text-blue-300 font-medium">+ Add New Exercise</button>
                          </div>
                        )}

                        <form onSubmit={handleAddExerciseToRoutine} className="flex gap-2">
                          <select value={rTarget} onChange={(e) => setRTarget(e.target.value)} className="flex-[2] bg-slate-800 border border-slate-600 rounded-lg px-2 py-1.5 text-xs text-slate-200">
                            {targets?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                          </select>
                          <input type="number" step="0.5" placeholder="Kg" required value={rWeight} onChange={(e) => setRWeight(e.target.value)} className="flex-1 w-12 bg-slate-800 border border-slate-600 rounded-lg px-2 py-1.5 text-xs text-slate-200" />
                          <input type="number" placeholder="Sets" required value={rSets} onChange={(e) => setRSets(e.target.value)} className="flex-1 w-12 bg-slate-800 border border-slate-600 rounded-lg px-2 py-1.5 text-xs text-slate-200" />
                          <input type="number" placeholder="Reps" required value={rReps} onChange={(e) => setRReps(e.target.value)} className="flex-1 w-12 bg-slate-800 border border-slate-600 rounded-lg px-2 py-1.5 text-xs text-slate-200" />
                          <button
                            type="submit"
                            className={`${isSelectedExerciseInRoutine ? 'bg-blue-600 hover:bg-blue-500' : 'bg-emerald-600 hover:bg-emerald-500'} px-3 py-1.5 rounded-lg text-xs font-semibold transition`}
                          >
                            {isSelectedExerciseInRoutine ? 'Update' : 'Add'}
                          </button>
                        </form>
                      </div>
                    </>
                  ) : (
                    <div className="text-xs text-slate-500 text-center mt-8">Please select or create a routine on the left.</div>
                  )}
                </div>

              </div>
            </div>

            {/* Result Box (Error Only) */}
            {resultMessage && resultType === 'error' && (
              <div className="p-4 rounded-xl text-xs font-medium shadow-lg bg-rose-950/80 border border-rose-500 text-rose-200">
                {resultMessage}
              </div>
            )}

            {/* Recent Activity (Last 14 Days) */}
            <div className="bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-700">

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-blue-300">Recent Activity (Last 14 Days)</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-slate-400">Weekly Goal:</span>
                    <select
                      value={weeklyGoal}
                      onChange={handleGoalChange}
                      className="bg-slate-900 border border-slate-700 rounded text-xs px-2 py-1 text-slate-200"
                    >
                      {[1, 2, 3, 4, 5, 6, 7].map(num => (
                        <option key={num} value={num}>{num} workouts / week</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={`px-4 py-2 rounded-xl text-xs font-bold border shadow-sm ${isGoalMet
                    ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400'
                    : 'bg-amber-950/80 border-amber-500/50 text-amber-400'
                  }`}>
                  {isGoalMet
                    ? `🎯 Goal Met! (${achieved14Days}/${target14Days} days)`
                    : `📉 Falling Behind (${achieved14Days}/${target14Days} days)`}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 p-4 bg-slate-900 rounded-xl border border-slate-700 min-h-[80px] items-center justify-center">
                {daysList.map((dayObj, index) => {
                  const hasWorkout = history.some(log => log?.date === dayObj.dateString);
                  return (
                    <div
                      key={index}
                      title={`Date: ${dayObj.displayLabel}`}
                      className={`w-12 h-14 rounded-xl flex flex-col items-center justify-center text-[10px] font-bold shadow-lg transition transform hover:scale-105 ${hasWorkout
                          ? 'bg-emerald-600 border border-emerald-400 text-white'
                          : 'bg-slate-800 border border-slate-700 text-slate-500'
                        }`}
                    >
                      <span className="text-[9px] opacity-80">{dayObj.displayLabel}</span>
                      <span className="text-sm mt-0.5">{hasWorkout ? '✓' : ''}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* History Table - Grouped by Date (ללא תגית Success) */}
            <div className="bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-700">
              <h2 className="text-lg font-semibold text-blue-300 mb-4">Workout Log History</h2>
              <div className="overflow-x-auto">
                {(!history || history.length === 0) ? (
                  <p className="p-4 text-center text-slate-500 text-xs">No logs yet.</p>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(
                      history.reduce((acc, log) => {
                        const d = log.date || 'Today';
                        if (!acc[d]) acc[d] = [];
                        acc[d].push(log);
                        return acc;
                      }, {})
                    )
                      .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
                      .map(([date, logs]) => (
                        <div key={date} className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
                          <div className="bg-slate-700/40 px-4 py-2 border-b border-slate-700 flex justify-between items-center">
                            <span className="text-sm font-bold text-blue-200">{date}</span>
                            <span className="text-xs text-slate-400">{logs.length} Exercises</span>
                          </div>
                          <table className="w-full text-left text-xs text-slate-300">
                            <thead className="bg-slate-800/50 text-slate-400 uppercase">
                              <tr>
                                <th className="p-3">Exercise</th>
                                <th className="p-3">Weight (kg)</th>
                                <th className="p-3 text-emerald-300">Sets</th>
                                <th className="p-3">Reps</th>
                                <th className="p-3 text-right">Delete</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                              {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-800/30 transition">
                                  <td className="p-3 font-medium text-slate-200">{log?.exercise?.name || 'Unknown'}</td>
                                  <td className="p-3">{log?.workingWeight}</td>
                                  <td className="p-3 font-bold text-emerald-400">{log?.sets || 0}</td>
                                  <td className="p-3">{log?.reps}</td>
                                  <td className="p-3 text-right">
                                    <button
                                      onClick={() => handleDeleteLog(log.id)}
                                      title="Delete Log"
                                      className="text-rose-400 hover:text-rose-300 opacity-80 hover:opacity-100 transition text-sm px-2 py-1 rounded bg-rose-950/30 border border-rose-500/20"
                                    >
                                      🗑️
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default App;