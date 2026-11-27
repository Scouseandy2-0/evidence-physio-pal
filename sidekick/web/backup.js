import { validateWorkspace } from './workspace-data.js';
export const backupVersion=7, backupLimit=4*1024*1024;
export function parseWorkspaceBackup(text) {
  if(typeof text!=='string'||new TextEncoder().encode(text).length>backupLimit)throw new Error('Use a workspace export file no larger than 4 MB.');
  let raw;try{raw=JSON.parse(text);}catch{throw new Error('This file is not valid JSON. The account copy has not been changed.');}
  if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('This file does not contain a workspace.');
  if(Object.hasOwn(raw,'workspace')) {
    if(!Number.isInteger(raw.version)||raw.version<1||raw.version>backupVersion)throw new Error('This backup version is not supported. Keep the original file and use a matching app version.');
    return checkedWorkspace(raw.workspace);
  }
  return checkedWorkspace(raw);
}
export function workspaceBackup(workspace,now=new Date()) {
  return JSON.stringify({version:backupVersion,exportedAt:now.toISOString(),workspace},null,2);
}

function checkedWorkspace(input) {
  const allowed=['saved','reflections','searches','appraisals','teachingPlans','studySets'];
  if(input && Object.keys(input).some(key=>!allowed.includes(key)))throw new Error('This backup contains an unsupported record type. Keep the original file; no records have been imported.');
  const workspace=validateWorkspace(input);
  if(new TextEncoder().encode(JSON.stringify(workspace)).length>2*1024*1024)throw new Error('The workspace exceeds the 2 MB account limit. Keep the original file and reduce a copy before importing.');
  return workspace;
}
