import { WorkspaceSync } from './sync.js';
import { emptyWorkspace, validateWorkspace } from './workspace-data.js';

// Explicit, tab-scoped product trial. No account IDs, localStorage or network writes.
export const trialRecordsKey = 'physiosidekick.trial.records.v1';
export class TrialWorkspaceSync extends WorkspaceSync {
  constructor(options) {
    super({ ...options, legacy: null });
    this.mode = 'trial';
  }
  get key() { return 'physiosidekick.trial.pending.v1'; }
  async request(method = 'GET', body) {
    let row;
    try {
      const raw = this.storage.getItem(trialRecordsKey);
      row = raw === null ? { revision: 0, workspace: emptyWorkspace(), updatedAt: null } : JSON.parse(raw);
      if (!Number.isSafeInteger(row?.revision) || row.revision < 0 || (row.updatedAt !== null && !Number.isFinite(Date.parse(row.updatedAt)))) throw new Error();
      row.workspace = validateWorkspace(row.workspace);
    } catch {
      throw new Error('This tab’s trial storage could not be read. Existing data has been left untouched. Check whether browser storage is available.');
    }
    const account = { id: 'tab-trial', name: 'Browser trial' };
    if (method === 'GET') return { ...row, account };
    if (method !== 'PUT') throw new Error('Unsupported trial operation.');
    if (body.accountId !== account.id || body.revision !== row.revision) {
      const error = new Error('This trial changed in another view. Keep your backup and refresh before combining.');
      error.status = 409;
      throw error;
    }
    const workspace = validateWorkspace(body.workspace);
    const next = { workspace, revision: row.revision + 1, updatedAt: new Date().toISOString() };
    if (new TextEncoder().encode(JSON.stringify(workspace)).length > 2 * 1024 * 1024) throw new Error('The trial exceeds 2 MB. Export a backup before reducing saved records.');
    try { this.storage.setItem(trialRecordsKey, JSON.stringify(next)); }
    catch { throw new Error('This tab could not save the trial. Export a backup now; your current changes remain in this window.'); }
    return { revision: next.revision, updatedAt: next.updatedAt };
  }
}
