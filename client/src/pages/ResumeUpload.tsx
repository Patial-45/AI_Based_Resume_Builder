import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { FiUpload, FiFileText, FiMoreHorizontal, FiArrowLeft, FiDownload } from 'react-icons/fi';
import { useAuth } from '../context/auth';
import { api, errorMessage } from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import UnsavedChanges from '../components/UnsavedChanges';
// Memory only: recover an interrupted session in this tab; never persist resume text in browser storage.
const interruptedDrafts = new Map<string, { text: string; revision: number }>();
window.addEventListener('session-logout', () => interruptedDrafts.clear());
interface Resume {
  _id: string; fileName: string; originalName?: string; fileSize: number; mimeType: string;
  createdAt: string; updatedAt: string; reviewStatus?: 'needs_review' | 'ready'; revision?: number; deletionRequestedAt?: string;
}
interface Detail extends Resume { extractedText: string; sourceText: string; versions: { revision: number; savedAt: string }[]; }
interface Limits { maxFileSize: number; maxResumes: number; maxTextLength: number; maxVersions: number; }
const fileTypes: Record<string, string> = { pdf: 'application/pdf', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', txt: 'text/plain' };
const kind = (resume: Resume) => resume.mimeType === 'application/pdf' ? 'PDF' : resume.mimeType.includes('wordprocessingml') ? 'DOCX' : 'TXT';
const size = (bytes: number) => bytes < 1024 * 1024 ? Math.max(1, Math.round(bytes / 1024)) + ' KB' : (bytes / (1024 * 1024)).toFixed(1) + ' MB';
const date = (value: string) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob), link = document.createElement('a');
  link.href = url; link.download = name; document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function downloadOriginal(resume: Resume) {
  const response = await api.get('/resumes/' + resume._id + '/download', { responseType: 'blob' });
  saveBlob(response.data, resume.originalName || resume.fileName);
}
function Status({ resume }: { resume: Resume }) {
  return <span className={'badge ' + (resume.reviewStatus === 'ready' ? 'badge-success' : 'badge-warning')}>{resume.deletionRequestedAt ? 'Deletion pending' : resume.reviewStatus === 'ready' ? 'Ready' : 'Needs review'}</span>;
}
function ResumeReview({ id, back }: { id: string; back: () => void }) {
  const { user } = useAuth();
  const ownerKey = useRef((user?._id || '') + ':' + id).current;
  const [resume, setResume] = useState<Detail | null>(null), [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true), [error, setError] = useState(''), [busy, setBusy] = useState(false), [status, setStatus] = useState('');
  const [pane, setPane] = useState<'source' | 'edit'>('edit'), [conflict, setConflict] = useState(false);
  const [version, setVersion] = useState<{ revision: number; text: string } | null>(null), [versionLoading, setVersionLoading] = useState(false);
  const dirty = !!resume && draft !== resume.extractedText;
  const liveDraft = useRef({ draft, resume, dirty }); liveDraft.current = { draft, resume, dirty };
  useEffect(() => {
    const remember = () => { const current = liveDraft.current; if (current.dirty && current.resume) { interruptedDrafts.clear(); interruptedDrafts.set(ownerKey, { text: current.draft, revision: current.resume.revision || 0 }); } };
    window.addEventListener('session-expired', remember);
    return () => window.removeEventListener('session-expired', remember);
  }, [ownerKey]);
  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError('');
    try { const { data } = await api.get<Detail>('/resumes/' + id, { signal }); const recovered = interruptedDrafts.get(ownerKey); setResume(recovered ? { ...data, revision: recovered.revision } : data); setDraft(recovered?.text ?? data.extractedText);
      if (recovered) { interruptedDrafts.delete(ownerKey); setStatus('Recovered unsaved edits from this tab. Review and save them.'); setConflict(recovered.revision !== (data.revision || 0)); } }
    catch (cause) { if (!axios.isCancel(cause)) setError(errorMessage(cause, 'Could not load this resume. Please retry.')); }
    finally { if (!signal?.aborted) setLoading(false); }
  }, [id, ownerKey]);
  useEffect(() => { const controller = new AbortController(); void load(controller.signal); return () => controller.abort(); }, [load]);
  async function save() {
    if (!resume) return; setBusy(true); setError(''); setStatus('');
    try {
      const { data } = await api.put<Resume & { extractedText: string }>('/resumes/' + id + '/content', { text: draft, revision: resume.revision || 0 });
      setResume({ ...resume, ...data, versions: [...resume.versions, { revision: data.revision || 0, savedAt: data.updatedAt }] });
      setDraft(data.extractedText); setConflict(false); setStatus('Reviewed content saved as version ' + data.revision + '.');
    } catch (cause) { setError(errorMessage(cause, 'Could not confirm this save. Your edits remain here.')); setConflict(axios.isAxiosError(cause) && cause.response?.data?.error?.code === 'REVISION_CONFLICT'); }
    finally { setBusy(false); }
  }
  async function latest() {
    setVersionLoading(true);
    try { const { data } = await api.get<Detail>('/resumes/' + id); setVersion({ revision: data.revision || 0, text: data.extractedText }); }
    catch (cause) { setError(errorMessage(cause)); } finally { setVersionLoading(false); }
  }
  async function viewVersion(revision: number) {
    setVersionLoading(true);
    try { setVersion((await api.get('/resumes/' + id + '/versions/' + revision)).data); }
    catch (cause) { setError(errorMessage(cause)); } finally { setVersionLoading(false); }
  }
  if (loading) return <section aria-busy="true"><h1 className="text-2xl font-semibold">Loading resume…</h1><div className="skeleton h-64 mt-6" /></section>;
  if (!resume) return <section><div className="page-heading"><h1>Resume unavailable</h1></div><div role="alert" className="form-alert error">{error}</div><div className="action-row"><Button variant="secondary" onClick={back}>Back to resumes</Button><Button onClick={() => void load()}>Retry</Button></div></section>;
  return <section className="review-page">
    <UnsavedChanges dirty={dirty || busy} />
    <button type="button" className="back-link" onClick={back}><FiArrowLeft aria-hidden="true" />Back to resumes</button>
    <div className="page-heading review-heading"><div><h1>{resume.fileName}</h1><p>Check the extracted facts before using this resume.</p></div><Status resume={resume} /></div>
    <div className="mobile-review-tabs workspace-tabs" role="tablist" aria-label="Resume review views">
      {(['source', 'edit'] as const).map(value => <button key={value} type="button" role="tab" id={'review-tab-' + value} aria-controls={'review-' + value} aria-selected={pane === value} tabIndex={pane === value ? 0 : -1} onClick={() => setPane(value)} onKeyDown={e => { if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) { e.preventDefault(); const next = e.key === 'Home' ? 'source' : e.key === 'End' ? 'edit' : pane === 'source' ? 'edit' : 'source'; setPane(next); document.getElementById('review-tab-' + next)?.focus(); } }}>{value === 'source' ? 'Source' : 'Edit'}</button>)}
    </div>
    <div className={'review-grid showing-' + pane}>
      <section id="review-source" className="card source-pane" aria-label="Original extraction">
        <div className="review-pane-header"><h2>Original extraction</h2><Button variant="ghost" size="sm" onClick={() => void downloadOriginal(resume).catch(cause => setError(errorMessage(cause, 'Could not download the original.')))} leftIcon={<FiDownload aria-hidden="true" />}>Download original</Button></div>
        <p className="supporting-text text-sm px-6 pb-4">Source text is preserved separately from your edits. The original file keeps its uploaded layout.</p>
        <pre tabIndex={0} className="source-text">{resume.sourceText}</pre>
      </section>
      <section id="review-edit" className="card edit-pane" aria-label="Reviewed content">
        <div className="review-pane-header"><h2>Reviewed content</h2><span className="supporting-text text-sm">Version {resume.revision || 0}</span></div>
        <div className="px-6 pb-6"><label htmlFor="resume-content" className="block font-semibold text-sm mb-2">Resume content</label>
          <p id="review-help" className="supporting-text text-sm mb-4">Correct contact details, dates and every section. Include only your actual experience. Saving confirms that you have reviewed this content.</p>
          <textarea id="resume-content" aria-describedby="review-help review-length" className="input resume-editor" value={draft} maxLength={100000} disabled={busy} onChange={e => { setDraft(e.target.value); setStatus(''); }} />
          <p id="review-length" className="supporting-text text-sm mt-3">{new TextEncoder().encode(draft).length.toLocaleString()} / 100,000 bytes · Plain text review; formatted export comes in the builder.</p>
        </div>
      </section>
    </div>
    {error && <div role="alert" className="form-alert error mt-5">{error}{conflict && <div className="mt-3"><Button variant="secondary" disabled={versionLoading} onClick={() => void latest()}>View latest saved content</Button><p className="mt-2">Your edits are still in the editor. Copy them before reloading this page to resolve the conflict.</p></div>}</div>}
    <div className="action-row save-row"><p className="save-state" role="status">{busy ? 'Saving reviewed content…' : status || (dirty ? 'Unsaved changes' : resume.reviewStatus === 'ready' ? 'All changes saved' : 'Review needed before first save')}</p><Button disabled={busy || !draft.trim() || new TextEncoder().encode(draft).length > 100000 || (!dirty && resume.reviewStatus === 'ready')} isLoading={busy} onClick={() => void save()}>Save reviewed content</Button></div>
    <section className="version-history"><h2>Saved versions</h2><p className="supporting-text text-sm">Up to 20 reviewed versions are retained with this resume. Earlier versions are read-only.</p>
      {resume.versions.length ? <div className="version-list">{resume.versions.slice().reverse().map(item => <Button key={item.revision} variant="secondary" disabled={versionLoading || busy} onClick={() => void viewVersion(item.revision)}>Version {item.revision} · {date(item.savedAt)}</Button>)}</div> : <p className="supporting-text mt-3">No reviewed version saved yet.</p>}
    </section>
    <Modal isOpen={!!version} onClose={() => setVersion(null)} title={'Saved version ' + (version?.revision || '')} size="lg">
      <pre tabIndex={0} className="source-text version-text">{version?.text}</pre><div className="action-row"><Button variant="secondary" onClick={() => { if (version) saveBlob(new Blob([version.text], { type: 'text/plain;charset=utf-8' }), 'resume-version-' + version.revision + '.txt'); }}>Download text</Button><Button onClick={() => setVersion(null)}>Close version</Button></div>
    </Modal>
  </section>;
}
export default function ResumeUpload() {
  const [search, setSearch] = useSearchParams(), selected = search.get('resume');
  const [resumes, setResumes] = useState<Resume[]>([]), [limits, setLimits] = useState<Limits | null>(null);
  const [loading, setLoading] = useState(true), [error, setError] = useState(''), [message, setMessage] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false), [file, setFile] = useState<File | null>(null), [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false), [progress, setProgress] = useState<number | null>(null), [dragging, setDragging] = useState(false);
  const [action, setAction] = useState<{ type: 'rename' | 'delete'; resume: Resume } | null>(null), [name, setName] = useState(''), [actionError, setActionError] = useState(''), [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const refresh = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError('');
    try { const [list, config] = await Promise.all([api.get<Resume[]>('/resumes', { signal }), api.get<Limits>('/resumes/limits', { signal })]); setResumes(list.data); setLimits(config.data); }
    catch (cause) { if (!axios.isCancel(cause)) setError(errorMessage(cause, 'Could not load your library. Please retry.')); }
    finally { if (!signal?.aborted) setLoading(false); }
  }, []);
  useEffect(() => { if (selected) return; const controller = new AbortController(); void refresh(controller.signal); return () => controller.abort(); }, [refresh, selected]);
  function choose(chosen?: File) {
    setUploadError(''); setFile(null); if (!chosen || !limits) return;
    const ext = chosen.name.split('.').pop()?.toLowerCase() || '';
    if (!fileTypes[ext] || (chosen.type && chosen.type !== fileTypes[ext])) { setUploadError('Choose a PDF, DOCX or plain text file.'); return; }
    if (!chosen.size || chosen.size > limits.maxFileSize) { setUploadError('Choose a non-empty file up to ' + size(limits.maxFileSize) + '.'); return; }
    setFile(chosen.type ? chosen : new File([chosen], chosen.name, { type: fileTypes[ext] }));
  }
  async function upload() {
    if (!file || uploading) return; setUploading(true); setUploadError(''); setProgress(null);
    const body = new FormData(); body.append('resume', file);
    try {
      const { data } = await api.post<Resume>('/resumes', body, { timeout: 90000, onUploadProgress: event => setProgress(event.total ? Math.min(100, Math.round(event.loaded / event.total * 100)) : null) });
      setUploadOpen(false); setFile(null); setSearch({ resume: data._id });
    } catch (cause) { setUploadError(errorMessage(cause, 'Could not confirm the upload. Close this dialog and refresh your library before trying again.')); }
    finally { setUploading(false); setProgress(null); }
  }
  async function confirmAction(event: React.FormEvent) {
    event.preventDefault(); if (!action) return; setBusy(true); setActionError('');
    try {
      if (action.type === 'rename') {
        const { data } = await api.put<Resume>('/resumes/' + action.resume._id, { fileName: name });
        setResumes(current => current.map(resume => resume._id === data._id ? { ...resume, ...data } : resume));
      } else {
        await api.delete('/resumes/' + action.resume._id);
        setResumes(current => current.filter(resume => resume._id !== action.resume._id));
      }
      // Apply only server-confirmed changes. A second GET must not turn a
      // successful rename/delete into a loading screen or unrelated list error.
      setMessage(action.type === 'rename' ? 'Resume renamed.' : 'Resume and linked matching activity deleted.'); setAction(null);
    } catch (cause) { setActionError(errorMessage(cause)); } finally { setBusy(false); }
  }
  const openAction = (type: 'rename' | 'delete', resume: Resume) => { setAction({ type, resume }); setName(resume.fileName); setActionError(''); };
  if (selected) return <ResumeReview key={selected} id={selected} back={() => setSearch({})} />;
  return <section className="resume-library">
    <div className="page-heading library-heading"><div><h1>Resumes</h1><p>Manage your originals and reviewed content.</p></div><Button disabled={!limits || uploading} leftIcon={<FiUpload aria-hidden="true" />} onClick={() => { setUploadOpen(true); setUploadError(''); }}>Upload resume</Button></div>
    {message && <p role="status" className="form-alert mb-5">{message}</p>}
    {uploading && !uploadOpen && <div role="status" className="form-alert mb-5">Your upload is still processing. <button type="button" className="underline" onClick={() => setUploadOpen(true)}>View progress</button></div>}
    {error ? <div className="library-empty"><p role="alert" className="form-alert error">{error}</p><Button className="mt-5" onClick={() => void refresh()}>Retry library</Button></div> : loading ? <div aria-busy="true" aria-label="Loading resumes" className="space-y-4"><div className="skeleton h-20" /><div className="skeleton h-20" /><div className="skeleton h-20" /></div> : resumes.length ? <div className="card library-list">
      <div className="library-columns supporting-text text-sm" aria-hidden="true"><span>Name</span><span>Status</span><span>Action</span></div>
      <ul>{resumes.map(resume => <li key={resume._id} className="resume-row">
        <div className="resume-name"><FiFileText aria-hidden="true" /><div><button type="button" className="resume-title" disabled={!!resume.deletionRequestedAt} onClick={() => setSearch({ resume: resume._id })}>{resume.fileName}</button><p className="supporting-text text-sm">{kind(resume)} · {size(resume.fileSize)} · Updated {date(resume.updatedAt || resume.createdAt)}</p></div></div>
        <div className="resume-status"><Status resume={resume} /></div>
        <div className="resume-actions"><Button variant="secondary" onClick={() => resume.deletionRequestedAt ? openAction('delete', resume) : setSearch({ resume: resume._id })}>{resume.deletionRequestedAt ? 'Retry delete' : resume.reviewStatus === 'ready' ? 'Open' : 'Review'}</Button>
          <details className="row-menu" onKeyDown={e => { if (e.key === 'Escape') { e.currentTarget.open = false; e.currentTarget.querySelector('summary')?.focus(); } }}><summary aria-label={'Actions for ' + resume.fileName}><FiMoreHorizontal aria-hidden="true" /></summary><div className="row-menu-panel">
            <button type="button" onClick={e => { e.currentTarget.closest('details')?.removeAttribute('open'); openAction('rename', resume); }}>Rename</button>
            <button type="button" onClick={e => { e.currentTarget.closest('details')?.removeAttribute('open'); void downloadOriginal(resume).catch(cause => setError(errorMessage(cause, 'Could not download the original. Retry your library and try again.'))); }}>Download original</button>
            <button type="button" className="destructive-text" onClick={e => { e.currentTarget.closest('details')?.removeAttribute('open'); openAction('delete', resume); }}>Delete resume</button>
          </div></details>
        </div>
      </li>)}</ul>
      <div className="library-footer supporting-text text-sm">PDF, DOCX or TXT · Up to {limits ? size(limits.maxFileSize) : '5 MB'} · {resumes.length} / {limits?.maxResumes || 20} resumes</div>
    </div> : <div className="card library-empty"><FiFileText aria-hidden="true" /><h2>Your resume library starts here</h2><p className="supporting-text">Upload your resume, check the extracted facts and save a reviewed version.</p><Button onClick={() => setUploadOpen(true)} disabled={!limits} className="mt-6">Upload your first resume</Button><p className="supporting-text text-sm mt-4">PDF, DOCX or TXT · Up to {limits ? size(limits.maxFileSize) : '5 MB'}</p></div>}
    <Modal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload resume">
      <p className="supporting-text mb-5">Choose a text-based PDF, DOCX or TXT file up to {limits ? size(limits.maxFileSize) : '5 MB'}. You will review the extracted content before saving it.</p>
      <div className={'upload-zone' + (dragging ? ' dragging' : '')} onDragOver={e => { e.preventDefault(); if (!uploading) setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={e => { e.preventDefault(); setDragging(false); if (!uploading) { if (e.dataTransfer.files.length !== 1) setUploadError('Choose one resume at a time.'); else choose(e.dataTransfer.files[0]); } }}>
        <FiUpload aria-hidden="true" /><p>Drop your resume here</p><span className="supporting-text text-sm">or choose a file from your device</span>
        <input ref={input} type="file" accept=".pdf,.docx,.txt" className="sr-only" tabIndex={-1} aria-label="Resume file" disabled={uploading} onChange={e => choose(e.target.files?.[0])} />
        <Button variant="secondary" disabled={uploading} className="mt-4" onClick={() => { if (input.current) { input.current.value = ''; input.current.click(); } }}>Browse files</Button>
      </div>
      {file && <p className="selected-file mt-4">{file.name}<span className="supporting-text"> · {size(file.size)}</span></p>}
      {uploading && <div className="mt-4" role="status"><p>{progress === 100 ? 'Reading document…' : progress === null ? 'Uploading document…' : 'Uploading document: ' + progress + '%'}</p>{progress !== null && progress < 100 && <progress className="upload-progress" value={progress} max={100} aria-label="Upload progress" />}<p className="supporting-text text-sm mt-2">You can close this dialog; processing will continue.</p></div>}
      {uploadError && <div className="form-alert error mt-4" role="alert">{uploadError}</div>}
      <div className="action-row"><Button variant="secondary" onClick={() => setUploadOpen(false)}>Close</Button><Button disabled={!file || uploading} isLoading={uploading} onClick={() => void upload()}>Upload and review</Button></div>
    </Modal>
    <Modal isOpen={!!action} onClose={() => { if (!busy) setAction(null); }} title={action?.type === 'delete' ? 'Delete resume?' : 'Rename resume'}>
      <form onSubmit={confirmAction}>{action?.type === 'rename' ? <Input label="Resume name" maxLength={200} required value={name} disabled={busy} onChange={e => setName(e.target.value)} helperText="This changes the library name. The original download keeps its filename." /> : <p className="supporting-text">Delete <strong>{action?.resume.fileName}</strong>, its original file, saved versions, match history and linked job activity? This cannot be undone in the app. Backup retention is managed separately.</p>}
        {actionError && <div role="alert" className="form-alert error mt-4">{actionError}</div>}<div className="action-row"><Button variant="secondary" disabled={busy} onClick={() => setAction(null)}>Cancel</Button><Button type="submit" variant={action?.type === 'delete' ? 'danger' : 'primary'} isLoading={busy} disabled={busy || (action?.type === 'rename' && !name.trim())}>{action?.type === 'delete' ? 'Delete resume' : 'Save name'}</Button></div>
      </form>
    </Modal>
  </section>;
}
