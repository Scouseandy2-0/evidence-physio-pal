import { validateWorkspace, mergeWorkspaces, hasRecords } from './workspace-data.js';

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
      const cached = this.read(this.key);
      if (cached?.invalidPending) {
        this.invalidPending = cached.invalidPending;
        this.onData(remote); this.emit('error', 'A previous device version failed validation. Export it from Backups & privacy before correcting and importing it. The account copy is unchanged.'); return;
      }
      if (cached?.pending) {
        this.pending = validateWorkspace(cached.pending);
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
  queue(workspace) {
    if (!this.account) return false;
    try {
      this.pending = validateWorkspace(workspace); this.invalidPending = null; this.sequence++;
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
    if (this.refreshing || this.combining) return;
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
      if (data.account?.id !== this.account?.id) { this.emit('unavailable', 'The signed-in account changed. Reload to continue.'); this.account = null; return; }
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
  async combine(device = this.pending, importing = false) {
    if (!this.account || !device || this.inflight || this.refreshTask || this.combining) return;
    const sequence = this.sequence;
    this.combining = true;
    this.emit('loading');
    try {
      const data = await this.request();
      if (data.account?.id !== this.account.id) throw new Error('The signed-in account changed. Reload before continuing.');
      if (this.sequence !== sequence || this.invalidPending) throw new Error('This device changed during recovery. Your new changes are kept here. Review recovery options again.');
      const merged = mergeWorkspaces(data.workspace, device);
      this.revision = data.revision; this.emit('pending'); this.queue(merged); this.onData(merged); this.combining = false; await this.flush();
      if (importing && !this.pending) { this.needsImport = false; this.write(`${this.key}.imported`, JSON.stringify(this.legacy)); this.onStatus(this); }
    } catch (e) { this.emit('conflict', e.message); }
    finally { this.combining = false; this.onStatus(this); }
  }
}
