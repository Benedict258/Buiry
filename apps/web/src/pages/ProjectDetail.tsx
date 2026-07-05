import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import {
  getProjectDetail,
  getProjectFile,
  saveProjectFile,
  getProjectMemory,
  type Project,
  type ProjectFile,
} from "../lib/api";

type Tab = "files" | "memory";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("files");
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [memory, setMemory] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      const data = await getProjectDetail(id);
      if (data) {
        setProject(data.project);
        setFiles(data.files);
        if (data.files.length > 0) {
          selectFile(data.files[0]);
        }
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const selectFile = async (file: ProjectFile) => {
    if (!id) return;
    const full = await getProjectFile(id, file.filename);
    if (full) {
      setSelectedFile(full);
      setEditingContent(full.content);
    }
  };

  const handleSave = async () => {
    if (!id || !selectedFile) return;
    setSaving(true);
    const ok = await saveProjectFile(id, selectedFile.filename, editingContent);
    if (ok) {
      setSelectedFile({ ...selectedFile, content: editingContent });
      toast.success("File saved");
    }
    setSaving(false);
  };

  const loadMemory = async () => {
    if (!id) return;
    const data = await getProjectMemory(id);
    setMemory(data);
    setActiveTab("memory");
  };

  const isMarkdown = (filename: string) =>
    filename.endsWith(".md");

  if (loading) {
    return (
      <div className="p-lg text-center">
        <p className="text-text-secondary text-sm">Loading project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-lg text-center space-y-md">
        <span className="material-icons-round text-text-secondary text-[48px]">error_outline</span>
        <p className="text-text-secondary">Project not found</p>
        <Link to="/projects" className="text-primary text-sm hover:underline">Back to projects</Link>
      </div>
    );
  }

  return (
    <div className="p-lg max-w-[1400px] mx-auto space-y-lg">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <Link to="/projects" className="text-text-secondary text-xs font-meta-mono hover:text-primary transition-colors">
            ← Projects
          </Link>
          <h1 className="text-headline-lg font-headline-lg font-bold text-text-primary mt-sm">
            {project.name}
          </h1>
          <p className="text-text-secondary text-sm font-body-base mt-xs">
            {project.description || "No description"}
          </p>
        </div>
        <div className="flex items-center gap-sm">
          <Link
            to="/projects"
            className="px-md py-sm border border-border-subtle text-text-secondary text-sm rounded hover:bg-surface-elevated transition-colors"
          >
            All Projects
          </Link>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-sm border-b border-border-subtle">
        {(["files", "memory"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              if (tab === "memory") loadMemory();
            }}
            className={`px-md py-sm text-sm font-body-base border-b-2 transition-colors ${
              activeTab === tab
                ? "border-primary text-primary font-medium"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab === "files" ? `Files (${files.length})` : "Memory"}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "files" && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-lg min-h-[60vh]">
          {/* File List */}
          <div className="bg-surface-card border border-border-subtle rounded-lg p-md space-y-xs">
            <h3 className="font-meta-mono text-[10px] text-text-secondary uppercase mb-sm">
              Project Files
            </h3>
            {files.length === 0 ? (
              <p className="text-text-secondary text-xs">No files yet. Run buiry_init.</p>
            ) : (
              files.map((f) => (
                <button
                  key={f.filename}
                  onClick={() => selectFile(f)}
                  className={`w-full text-left px-sm py-2 rounded text-sm flex items-center gap-sm transition-colors ${
                    selectedFile?.filename === f.filename
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
                  }`}
                >
                  <span className="material-icons-round text-[16px]">
                    {isMarkdown(f.filename) ? "description" : "insert_drive_file"}
                  </span>
                  <span className="truncate">{f.filename}</span>
                </button>
              ))
            )}
          </div>

          {/* File Editor */}
          <div className="md:col-span-4 bg-surface-card border border-border-subtle rounded-lg p-lg space-y-md">
            {selectedFile ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-sm">
                    <span className="material-icons-round text-primary text-[20px]">
                      {isMarkdown(selectedFile.filename) ? "description" : "insert_drive_file"}
                    </span>
                    <h3 className="text-text-primary font-body-base font-medium">
                      {selectedFile.filename}
                    </h3>
                    <span className="text-text-secondary font-meta-mono text-[10px]">
                      Updated {new Date(selectedFile.updated_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-sm">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-md py-sm bg-primary text-on-primary text-sm font-medium rounded hover:bg-primary/80 disabled:opacity-50 transition-colors"
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>

                {isMarkdown(selectedFile.filename) ? (
                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    className="w-full h-[50vh] px-md py-sm bg-surface-container border border-border-subtle rounded font-meta-mono text-sm text-text-primary focus:outline-none focus:border-primary/50 resize-none"
                    spellCheck={false}
                  />
                ) : (
                  <pre className="w-full h-[50vh] overflow-auto bg-surface-container border border-border-subtle rounded p-md font-meta-mono text-sm text-text-primary whitespace-pre-wrap">
                    {editingContent}
                  </pre>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-text-secondary">
                <span className="material-icons-round text-[48px]">insert_drive_file</span>
                <p className="text-sm mt-sm">Select a file to view</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Memory Tab */}
      {activeTab === "memory" && (
        <div className="bg-surface-card border border-border-subtle rounded-lg p-lg">
          <div className="flex items-center justify-between mb-md">
            <h3 className="text-text-primary font-body-base font-medium">
              Build-Context-Memory.json
            </h3>
            <span className="text-text-secondary font-meta-mono text-[10px]">
              Composed from sessions in PostgreSQL
            </span>
          </div>

          {memory ? (
            <pre className="w-full max-h-[60vh] overflow-auto bg-surface-container border border-border-subtle rounded p-md font-meta-mono text-xs text-text-primary">
              {JSON.stringify(memory, null, 2)}
            </pre>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-text-secondary">
              <span className="material-icons-round text-[48px]">memory</span>
              <p className="text-sm mt-sm">Loading memory...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
