import { IpcEvents } from '../ipc-events';
import { Project } from './types';

const { ipcRenderer } = require('electron');

class WorkspaceService {
  public async getAllProjects(): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.WORKSPACE_PROJECT_LIST);
    return response;
  }

  public async deleteProject(args): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.WORKSPACE_DELETE_PROJECT, args);
    return response;
  }
}

export const workspaceService = new WorkspaceService();