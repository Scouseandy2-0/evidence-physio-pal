import { validateWorkspace, mergeWorkspaces, hasRecords, emptyWorkspace } from './workspace-data.js';

export class WorkspaceSync {
  constructor({ onData, onStatus, storage = globalThis.localStorage, fetcher = (...args) => globalThis.fetch(...args), legacy = null, delay = 600 }) {
    Object.assign(this, { onData, onStatus, storage, fetcher, legacy, delay });
    this.status = 'loading'; this.account = null; this.revision = 0; this.pending = null; this.inflight = null; this.sequence = 0; this.timer = null; this.error = ''; this.updatedAt = null;
  }
  emit(status, error = '') { this.status = status; this.error = error; this.onStatus(this); }
  read(key) { try { return JSON.parse(this.storage.getItem(key)); } catch { return null; } }
  write(key, value) { try { this.storage.setItem(key, JSON.stringify(value)); } catch { this.cacheFailed = true; } }
  get key() { return `physiosidekick.account.${this.account.id}`; }
  cache() { this.write(this.key, { revision: this.revision, pending: this.pending, invalidPending: this.invalidPending || null }); }
  async request(method = 'GET', body) {
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await this.fetcher('/api/workspace', { method, signal: controller.signal, credentials: 'same-origin', headers: { 'content-type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
      const data = await response.json();
      if (!response.ok) { const error = new Error(data.error || 'Account storage is unavailable.'); error.status = response.status; throw error; }
      return data;
    } catch (e) { if (e.name === 'AbortError') throw new Error('Account storage took too long. Pending changes remain on this device.'); throw e; }
    finally { clearTimeout(timer); }
  }
  async init() {
    try {
      const data = await this.request();
      if (!data.account?.id || !Number.isSafeInteger(data.revision) || data.revision < 0) throw new Error('Unexpected account response.');
      const remote = validateWorkspace(data.workspace);
      this.account = data.account; this.revision = data.revision; this.updatedAt = data.updatedAt;
      let rawCache = null, cached = null;
      try { rawCache = this.storage.getItem(this.key); } catch { this.cacheFailed = true; }
      try {
        cached = rawCache === null ? null : JSON.parse(rawCache);
        if (cached !== null && (typeof cached !== 'object' || Array.isArray(cached) || !Number.isSafeInteger(cached.revision) || cached.revision < 0)) throw new Error('Unexpected cache envelope');
        if (rawCache !== null && cached === null) throw new Error('Unexpected null cache');
      } catch {
        this.invalidPending = { recoveryReason: 'The device cache could not be parsed. Keep this original text for recovery; this is not an import-ready workspace.', rawDeviceCache: rawCache };
        this.recoveryRequired = true; this.cache(); this.onData(remote);
        this.emit('error', 'The device recovery cache could not be read. Account records are shown unchanged. Export the recovery copy and review recovery options before editing.'); return;
      }
      if (cached?.invalidPending) {
        this.invalidPending = cached.invalidPending; this.recoveryRequired = true;
        this.onData(remote); this.emit('error', 'A previous device version failed validation. Export it from Backups & privacy before correcting and importing it. The account copy is unchanged.'); return;
      }
      if (cached?.pending) {
        try { this.pending = validateWorkspace(cached.pending); }
        catch {
          // Keep the failed device snapshot exportable; never upload it or hide valid account records.
          this.pending = null; this.invalidPending = structuredClone(cached.pending); this.recoveryRequired = true;
          this.cache(); this.onData(remote);
          this.emit('error', 'A pending device copy failed validation. Your account records are shown unchanged. Export the device recovery copy from Backups & privacy before correcting and importing it, or review recovery options to use the account version.');
          return;
        }
        this.onData(this.pending);
        if (cached.revision !== this.revision) { this.emit('conflict', 'Another device has a newer version. Your pending version is kept here.'); return; }
        this.emit('pending'); await this.flush();
      } else { this.onData(remote); this.emit('saved'); }
      this.checkLegacy();
    } catch (e) { this.emit(this.account ? 'offline' : 'unavailable', e.message); }
  }
  checkLegacy() {
    if (!this.legacy || !hasRecords(this.legacy)) return;
    const fingerprint = JSON.stringify(this.legacy);
    if (this.read(`${this.key}.imported`) !== fingerprint) this.needsImport = true;
    this.onStatus(this);
  }
  queue(workspace, { recovering = false } = {}) {
    if (!this.account || this.replacing) return false;
    if (this.recoveryRequired && !recovering) { this.emit('error', 'Workspace editing is paused to protect a recovered device copy. Export it and review recovery options before continuing.'); return false; }
    try {
      this.pending = validateWorkspace(workspace); this.invalidPending = null; this.recoveryRequired = false; this.sequence++;
      this.cache();
      if (this.status === 'conflict') { this.onStatus(this); return true; }
      this.emit('pending'); clearTimeout(this.timer); this.timer = setTimeout(() => this.flush(), this.delay); return true;
    } catch (e) {
      clearTimeout(this.timer); this.sequence++; this.invalidPending = structuredClone(workspace);
      this.cache();
      this.emit('error', `${e.message} Export this device’s version from Backups & privacy; the account copy has not been replaced.`); return false;
    }
  }
  async flush() {
    clearTimeout(this.timer);
    if (this.inflight) return this.inflight;
    if (this.refreshing || this.combining || this.replacing) return;
    if (!this.pending || !this.account || this.invalidPending || this.status === 'conflict') return;
    const sequence = this.sequence, snapshot = this.pending, revision = this.revision;
    this.emit('saving');
    this.inflight = (async () => {
      try {
        const data = await this.request('PUT', { revision, accountId: this.account.id, workspace: snapshot });
        if (data.revision !== revision + 1 || typeof data.updatedAt !== 'string' || !Number.isFinite(Date.parse(data.updatedAt))) throw new Error('Account saving was not confirmed. Your pending changes remain on this device.');
        this.revision = data.revision; this.updatedAt = data.updatedAt;
        if (this.invalidPending) { this.cache(); this.emit('error', 'This device has an invalid edit. Export it from Backups & privacy before correcting it.'); }
        else if (this.sequence === sequence) { this.pending = null; this.cache(); this.emit('saved'); }
        else { this.cache(); this.emit('pending'); }
      } catch (e) { this.emit(e.status === 409 ? 'conflict' : 'offline', e.message); }
      finally { this.inflight = null; }
    })();
    await this.inflight;
    if (this.pending && this.status === 'pending') return this.flush();
  }
  refresh() {
    if (this.replacing) return Promise.resolve();
    if (this.refreshTask) return this.refreshTask;
    if (this.combining) return Promise.resolve();
    this.refreshTask = this.refreshAccount().finally(() => { this.refreshTask = null; });
    return this.refreshTask;
  }
  async refreshAccount() {
    if (this.invalidPending) { this.onStatus(this); return; }
    if (this.pending) { await this.flush(); if (this.pending) return; }
    const old = this.status, sequence = this.sequence, revision = this.revision;
    this.refreshing = true; this.emit('loading');
    try {
      const data = await this.request();
      if (data.account?.id !== this.account?.id) { this.account = null; this.onData(emptyWorkspace()); this.emit('unavailable', 'The signed-in account changed. Reload to continue.'); return; }
      if (!Number.isSafeInteger(data.revision) || data.revision < revision) throw new Error('The account refresh could not be verified. Your device version is unchanged.');
      const remote = validateWorkspace(data.workspace);
      if (this.invalidPending) { this.emit('error', 'This device has an invalid edit. Export it from Backups & privacy before correcting it.'); return; }
      if (this.sequence !== sequence || this.pending) {
        // A delayed read must never replace edits made while it was in flight.
        if (data.revision !== revision) this.emit('conflict', 'Another device changed these records while you were editing. Your pending version is kept here.');
        else this.emit('pending');
      } else {
        this.revision = data.revision; this.updatedAt = data.updatedAt; this.onData(remote); this.emit('saved'); this.checkLegacy();
      }
    } catch (e) { this.emit(old === 'conflict' ? old : 'offline', e.message); }
    finally { this.refreshing = false; }
    if (this.pending && this.status === 'pending') await this.flush();
  }
  async combine(device = this.pending, importing = false, acknowledgeLegacy = importing) {
    if (!this.account || !device || this.inflight || this.refreshTask || this.combining || this.replacing) return;
    const sequence = this.sequence, invalidBefore = this.invalidPending;
    this.combining = true;
    this.emit('loading');
    try {
      const data = await this.request();
      if (data.account?.id !== this.account.id) throw new Error('The signed-in account changed. Reload before continuing.');
      if (this.sequence !== sequence || this.invalidPending !== invalidBefore) throw new Error('This device changed during recovery. Your new changes are kept here. Review recovery options again.');
      if (invalidBefore && !importing) throw new Error('Export and correct the invalid device version, then import that corrected backup.');
      if (!Number.isSafeInteger(data.revision) || data.revision < this.revision) throw new Error('The account version could not be verified. Keep your recovery file and retry.');
      const base = importing && this.pending && this.pending !== device ? mergeWorkspaces(data.workspace, this.pending) : data.workspace;
      const merged = mergeWorkspaces(base, device);
      this.revision = data.revision; this.emit('pending'); if(!this.queue(merged, { recovering: importing }))return; this.onData(merged); this.combining = false; await this.flush();
      if (acknowledgeLegacy && importing && this.status === 'saved' && !this.pending && !this.invalidPending) { this.needsImport = false; this.write(`${this.key}.imported`, JSON.stringify(this.legacy)); this.onStatus(this); }
    } catch (e) { this.emit('conflict', e.message); }
    finally { this.combining = false; this.onStatus(this); }
  }
  async replaceRecords(mode, confirmation) {
    if (!['clear', 'account'].includes(mode)) return false;
    if (!this.account || this.replacing || this.inflight || this.refreshTask || this.combining || this.refreshing) return false;
    // The confirmation belongs to a particular device version, not a later edit.
    if (confirmation?.revision !== this.revision || confirmation?.sequence !== this.sequence) return false;
    if (mode === 'clear' && (this.status !== 'saved' || this.pending || this.invalidPending)) return false;
    const accountId = this.account.id, revision = this.revision, oldStatus = this.status;
    this.replacing = true; clearTimeout(this.timer); this.emit('loading');
    try {
      let data, records;
      if (mode === 'clear') {
        // Keep a monotonically increasing revision so stale devices cannot re-create records.
        data = await this.request('PUT', { accountId, revision, workspace: emptyWorkspace() });
        if (data.revision !== revision + 1 || !Number.isFinite(Date.parse(data.updatedAt))) throw new Error('Clearing was not confirmed. Refresh the account to check its current records before trying again.');
        records = emptyWorkspace();
      } else {
        data = await this.request();
        if (data.account?.id !== accountId || !Number.isSafeInteger(data.revision) || data.revision < revision) throw new Error('The account version could not be verified. Your device version is kept.');
        records = validateWorkspace(data.workspace);
      }
      this.revision = data.revision; this.updatedAt = data.updatedAt;
      this.pending = null; this.invalidPending = null; this.recoveryRequired = false; this.sequence++;
      if (mode === 'clear') {
        this.legacy = null; this.needsImport = false;
        try { this.storage.removeItem(this.key); this.storage.removeItem(`${this.key}.imported`); this.storage.removeItem('physiosidekick.workspace.v1'); }
        catch { this.cacheFailed = true; }
      }
      this.cache(); this.onData(records); this.emit('saved'); return true;
    } catch (error) {
      this.emit(error.status === 409 || oldStatus === 'conflict' ? 'conflict' : 'offline', error.message);
      return false;
    } finally { this.replacing = false; this.onStatus(this); }
  }
}
