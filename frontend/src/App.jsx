import { useState } from 'react'

const navigation = [
  { id: 'dashboard', icon: '⌂', label: 'Dashboard' },
  { id: 'assistant', icon: '✳', label: 'AI Assistant' },
  { id: 'knowledge', icon: '▤', label: 'My Knowledge' },
  { id: 'tasks', icon: '✓', label: 'Tasks & Goals' },
  { id: 'planner', icon: '▦', label: 'Daily Planner' },
  { id: 'analytics', icon: '↗', label: 'Analytics' },
]

const initialTasks = [
  {
    id: 1,
    title: 'Revise DBMS normalization',
    category: 'Placement Preparation',
    time: '9:00 AM',
    completed: true,
  },
  {
    id: 2,
    title: 'Practice 3 DSA problems',
    category: 'Coding Practice',
    time: '11:00 AM',
    completed: false,
  },
  {
    id: 3,
    title: 'Work on TwinMind AI',
    category: 'Personal Project',
    time: '2:00 PM',
    completed: false,
  },
]

const suggestions = [
  'Create my study plan',
  'Explain my project',
  'Review my goals',
]

function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="flex w-full shrink-0 flex-col border-r border-slate-200 bg-white p-5 md:min-h-screen md:w-64">
      <a href="#" className="mb-10 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-bold text-white">
          T
        </div>

        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">
            TwinMind
          </h1>
          <p className="text-xs text-slate-500">Your personal AI</p>
        </div>
      </a>

      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
        Workspace
      </p>

      <nav className="flex flex-wrap gap-2 md:flex-col">
        {navigation.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
              activePage === item.id
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="flex h-6 w-6 items-center justify-center text-lg">
              {item.icon}
            </span>

            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
        <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-lg text-indigo-600">
          ✨
        </div>

        <h3 className="font-semibold text-slate-900">
          Your AI companion
        </h3>

        <p className="mt-2 text-xs leading-5 text-slate-600">
          Organize your knowledge, achieve your goals, and make every day count.
        </p>

        <div className="mt-4 rounded-lg bg-white px-3 py-2 text-center text-xs font-semibold text-indigo-700">
          Personal workspace
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5 md:mt-auto md:pt-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-700">
          U
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            Your Workspace
          </p>
          <p className="text-xs text-slate-500">Personal account</p>
        </div>
      </div>
    </aside>
  )
}

function StatCard({ icon, label, value, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100/50">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-xl text-indigo-600">
          {icon}
        </div>
      </div>

      <p className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>

      <p className="mt-2 text-xs text-slate-500">{description}</p>
    </div>
  )
}

function TaskList({ tasks, onToggle }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100/50">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-slate-900">Today's priorities</h2>
          <p className="mt-1 text-xs text-slate-500">
            Keep moving toward your goals
          </p>
        </div>

        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
          {tasks.filter((task) => task.completed).length}/{tasks.length} done
        </span>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-start gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-slate-200"
          >
            <button
              onClick={() => onToggle(task.id)}
              aria-label={
                task.completed
                  ? `Mark ${task.title} as incomplete`
                  : `Mark ${task.title} as complete`
              }
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs ${
                task.completed
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-slate-300 bg-white text-transparent'
              }`}
            >
              ✓
            </button>

            <div className="min-w-0 flex-1">
              <p
                className={`text-sm font-medium ${
                  task.completed
                    ? 'text-slate-400 line-through'
                    : 'text-slate-800'
                }`}
              >
                {task.title}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {task.category}
              </p>
            </div>

            <span className="shrink-0 text-xs text-slate-400">
              {task.time}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

function AssistantCard({ onSend }) {
  const [message, setMessage] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    const trimmedMessage = message.trim()

    if (!trimmedMessage) return

    onSend(trimmedMessage)
    setMessage('')
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm shadow-indigo-100/40">
      <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-5 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-xl">
            ✳
          </div>

          <div>
            <h2 className="font-bold">Your AI assistant</h2>
            <p className="mt-1 text-xs text-indigo-100">
              A smarter way to organize your day
            </p>
          </div>
        </div>
      </div>

      <div className="p-5">
        <p className="text-sm leading-6 text-slate-600">
          What would you like to work on today? Ask a question or choose a
          suggestion to get started.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => onSend(suggestion)}
              className="rounded-full border border-slate-200 px-3 py-2 text-xs text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-5">
          <label htmlFor="assistant-message" className="sr-only">
            Ask your assistant
          </label>

          <textarea
            id="assistant-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Ask your personal AI..."
            rows={3}
            className="w-full resize-none rounded-xl border border-slate-200 p-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
          />

          <button
            type="submit"
            className="mt-3 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Start a conversation →
          </button>
        </form>
      </div>
    </section>
  )
}

function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [tasks, setTasks] = useState(initialTasks)
  const [lastPrompt, setLastPrompt] = useState('')

  function toggleTask(taskId) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? { ...task, completed: !task.completed }
          : task,
      ),
    )
  }

  function handleAssistantMessage(message) {
    setLastPrompt(message)
    setActivePage('assistant')
  }

  const completedTasks = tasks.filter((task) => task.completed).length

  const activeLabel =
    navigation.find((item) => item.id === activePage)?.label ?? 'Dashboard'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 md:flex">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">
              Your personal workspace
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              {activePage === 'dashboard'
                ? 'Welcome back 👋'
                : activeLabel}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Turn your knowledge into meaningful progress.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">
                Personal workspace
              </p>
              <p className="text-xs text-slate-500">Your goals, your pace</p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
              U
            </div>
          </div>
        </header>

        {activePage !== 'dashboard' && (
          <div className="mb-6 rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-800">
            <span className="font-semibold">{activeLabel}</span> is part of our
            planned application. Today, we're building the shared dashboard
            foundation; this section's full functionality will be added in
            upcoming development days.
          </div>
        )}

        {activePage === 'assistant' && lastPrompt && (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Your latest message
            </p>
            <p className="mt-2 text-sm text-slate-700">{lastPrompt}</p>
            <p className="mt-3 text-xs text-slate-500">
              AI responses will be connected when we implement the backend and
              LLM integration.
            </p>
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon="✓"
            label="Tasks completed"
            value={`${completedTasks}/${tasks.length}`}
            description="Your current sample task list"
          />

          <StatCard
            icon="◎"
            label="Active goals"
            value="03"
            description="Sample goals for the dashboard"
          />

          <StatCard
            icon="▤"
            label="Knowledge items"
            value="12"
            description="Documents and notes — sample data"
          />

          <StatCard
            icon="✳"
            label="AI interactions"
            value="08"
            description="Sample activity count"
          />
        </section>

        <section className="mt-6 grid items-start gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100/50 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-indigo-600">
                    Your daily focus
                  </p>

                  <h2 className="mt-2 text-xl font-bold text-slate-900">
                    Small steps, big progress.
                  </h2>

                  <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
                    Build consistent habits, keep your knowledge organized,
                    and make progress toward your personal goals.
                  </p>
                </div>

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl">
                  🎯
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-2 flex justify-between text-xs">
                  <span className="font-medium text-slate-600">
                    Sample daily progress
                  </span>

                  <span className="font-semibold text-indigo-600">
                    {Math.round((completedTasks / tasks.length) * 100)}%
                  </span>
                </div>

                <div
                  className="h-2 overflow-hidden rounded-full bg-slate-100"
                  role="progressbar"
                  aria-label="Daily task completion"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(
                    (completedTasks / tasks.length) * 100,
                  )}
                >
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                    style={{
                      width: `${(completedTasks / tasks.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <TaskList tasks={tasks} onToggle={toggleTask} />
          </div>

          <div className="space-y-6">
            <AssistantCard onSend={handleAssistantMessage} />

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100/50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-900">
                    Your next steps
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Build your personal knowledge system
                  </p>
                </div>

                <span className="text-xl">✦</span>
              </div>

              <div className="mt-4 space-y-3">
                {[
                  'Organize your learning notes',
                  'Set your weekly goals',
                  'Upload your first document',
                ].map((item, index) => (
                  <div key={item} className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-600">
                      {index + 1}
                    </span>

                    <p className="text-sm text-slate-600">{item}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>

        <footer className="mt-8 border-t border-slate-200 py-5 text-center text-xs text-slate-400">
          TwinMind AI · Your personal knowledge and productivity assistant
        </footer>
      </main>
    </div>
  )
}

export default App