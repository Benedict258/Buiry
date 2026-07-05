import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProjects, createProject, deleteProject, type Project } from "../lib/api";

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const fetchProjects = async () => {
    setLoading(true);
    const data = await getProjects();
    setProjects(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    setError("");

    try {
      const project = await createProject(name.trim(), description.trim());
      if (project) {
        setName("");
        setDescription("");
        setShowCreate(false);
        fetchProjects();
      } else {
        setError("Failed to create project. Check your API connection.");
      }
    } catch {
      setError("Connection error. Is the backend running?");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete project "${name}"? This cannot be undone.`)) return;
    await deleteProject(id);
    fetchProjects();
  };

  return (
    <div className="p-lg max-w-[1200px] mx-auto space-y-lg">
      <header className="flex items-center justify-between">
        <div className="border-l-4 border-primary pl-md">
          <h1 className="text-headline-lg font-headline-lg font-bold text-text-primary">
            Projects
          </h1>
          <p className="text-text-secondary font-meta-mono text-[10px] uppercase tracking-wider mt-xs">
            Your buiry_init workspaces
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-md py-sm bg-primary text-on-primary font-body-base text-sm font-medium rounded hover:bg-primary/80 transition-colors"
        >
          New Project
        </button>
      </header>

      {/* Error */}
      {error && (
        <div className="px-md py-sm bg-error/10 border border-error/30 rounded text-error text-sm">
          {error}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-background/50 z-50 flex items-center justify-center p-md">
          <div className="bg-surface-card border border-border-subtle rounded-lg p-lg w-full max-w-md space-y-md">
            <div className="flex items-center justify-between">
              <h2 className="font-section-header text-sm font-semibold text-text-primary">
                Create Project
              </h2>
              <button onClick={() => setShowCreate(false)} className="text-text-secondary hover:text-text-primary">
                <span className="material-icons-round text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-sm">
              <label className="text-text-secondary font-meta-mono text-[10px] uppercase">
                Project Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="e.g. my-saas-backend"
                className="w-full px-md py-sm bg-surface-container border border-border-subtle rounded text-text-primary text-sm focus:outline-none focus:border-primary/50"
                autoFocus
              />
            </div>

            <div className="space-y-sm">
              <label className="text-text-secondary font-meta-mono text-[10px] uppercase">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this project about?"
                rows={3}
                className="w-full px-md py-sm bg-surface-container border border-border-subtle rounded text-text-primary text-sm focus:outline-none focus:border-primary/50 resize-none"
              />
            </div>

            <div className="flex gap-sm justify-end">
              <button
                onClick={() => setShowCreate(false)}
                className="px-md py-sm border border-border-subtle text-text-secondary text-sm rounded hover:bg-surface-elevated"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!name.trim() || creating}
                className="px-md py-sm bg-primary text-on-primary text-sm font-medium rounded hover:bg-primary/80 disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project List */}
      {loading ? (
        <div className="text-center py-lg">
          <p className="text-text-secondary text-sm">Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-lg bg-surface-card border border-border-subtle rounded-lg">
          <span className="material-icons-round text-text-secondary text-[48px]">folder_open</span>
          <p className="text-text-secondary text-sm mt-sm">No projects yet</p>
          <p className="text-text-secondary text-xs mt-xs">
            Create a project or run <code className="bg-surface-container px-1 rounded text-[11px]">buiry_init</code> from your MCP
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group bg-surface-card border border-border-subtle rounded-lg p-lg space-y-sm hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between">
                <Link
                  to={`/projects/${project.id}`}
                  className="flex-1 min-w-0"
                >
                  <h3 className="text-text-primary font-body-base font-medium truncate">
                    {project.name}
                  </h3>
                  <p className="text-text-secondary text-xs font-body-base mt-1 line-clamp-2">
                    {project.description || "No description"}
                  </p>
                </Link>
                <button
                  onClick={(e) => { e.preventDefault(); handleDelete(project.id, project.name); }}
                  className="opacity-0 group-hover:opacity-100 text-text-secondary hover:text-error transition-all ml-sm"
                  title="Delete project"
                >
                  <span className="material-icons-round text-[16px]">delete</span>
                </button>
              </div>

              <div className="flex items-center gap-sm pt-sm border-t border-border-subtle">
                <span className="text-text-secondary font-meta-mono text-[10px]">
                  Created {new Date(project.created_at).toLocaleDateString()}
                </span>
                <Link
                  to={`/projects/${project.id}`}
                  className="ml-auto text-primary font-meta-mono text-[10px] hover:underline"
                >
                  Open →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MCP Setup Hint */}
      {projects.length > 0 && (
        <section className="bg-surface-card border border-border-subtle rounded-lg p-md space-y-xs">
          <p className="text-text-secondary font-meta-mono text-[10px] uppercase">
            MCP Setup
          </p>
          <pre className="text-text-primary text-xs font-meta-mono">
{`{
  "mcpServers": {
    "buiry": {
      "command": "npx",
      "args": ["-y", "@buiry/mcp"],
      "env": {
        "BUIRY_API_KEY": "<your key from Settings>"
      }
    }
  }
}`}
          </pre>
        </section>
      )}
    </div>
  );
}
