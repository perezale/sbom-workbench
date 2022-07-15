import { ipcMain } from 'electron';
import log from 'electron-log';
import { IpcChannels } from '../ipc-channels';
import { workspace } from '../../main/workspace/Workspace';
import { Response } from '../Response';
import { INewProject, IProject, License } from '../types';
import { ProjectFilterPath } from '../../main/workspace/filters/ProjectFilterPath';
import { ProjectZipper } from '../../main/workspace/ProjectZipper';
import { ScanTask } from '../../main/task/scanner/ScanTask';

ipcMain.handle(IpcChannels.WORKSPACE_PROJECT_LIST, async (_event) => {
  try {
    const projects = await workspace.getProjectsDtos();
    return Response.ok({
      message: 'Projects list retrieved succesfully',
      data: projects,
    });
  } catch (error: any) {
    log.error(error);
    return Response.fail({ message: error.message });
  }
});

ipcMain.handle(IpcChannels.WORKSPACE_DELETE_PROJECT, async (_event, projectPath: string) => {
  try {
    await workspace.removeProjectFilter(new ProjectFilterPath(projectPath));
    return Response.ok();
  } catch (error: any) {
    log.error(error);
    return Response.fail({ message: error.message });
  }
});

// This service creates a new project and launch automatically the scanner.
// In future versions, the scanner will be launched by the user.
ipcMain.handle(IpcChannels.WORKSPACE_CREATE_PROJECT, async (_event, project: INewProject) => {
  try {
    const scanTask = new ScanTask();
    await scanTask.set(project);
    await scanTask.init();
    await scanTask.run();
    return Response.ok();
  } catch (error: any) {
    log.error(error);
    return Response.fail({ message: error.message });
  }
});

ipcMain.handle(IpcChannels.UTILS_GET_PROJECT_DTO, async (_event) => {
  try {
    const path: IProject = workspace.getOpenedProjects()[0].getDto();
    return Response.ok({ message: 'Project path succesfully retrieved', data: path });
  } catch (e: any) {
    log.error(e);
    return Response.fail({ message: e.message });
  }
});

ipcMain.handle(IpcChannels.GET_LICENSES, async (_event) => {
  try {
    const licenses: Array<License> = workspace.getLicenses();
    return Response.ok({ message: 'Project path succesfully retrieved', data: licenses });
  } catch (e: any) {
    log.log('Catch an error: ', e);
    return Response.fail({ message: e.message });
  }
});

ipcMain.handle(IpcChannels.WORKSPACE_IMPORT_PROJECT, async (_event, zippedProjectPath: string) => {
  try {
    const Iproject = await new ProjectZipper().import(zippedProjectPath);
    return Response.ok({ message: 'Project imported succesfully', data: Iproject });
  } catch (e: any) {
    log.error('Catch an error: ', e);
    return Response.fail({ message: e.message });
  }
});

ipcMain.handle(IpcChannels.WORKSPACE_EXPORT_PROJECT, async (_event, pathToSave: string, projectPath: string) => {
  try {
    await new ProjectZipper().export(pathToSave, projectPath);
    return Response.ok({ message: 'Project exported succesfully', data: true });
  } catch (e: any) {
    log.error('Catch an error: ', e);
    return Response.fail({ message: e.message });
  }
});
