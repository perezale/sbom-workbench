import log from 'electron-log';
import { Scanner } from 'main/task/scanner/types';
import i18next from 'i18next';
import { app, utilityProcess } from 'electron';
import path from 'path';
import { modelProvider } from '../../../services/ModelProvider';
import { Indexer } from '../../../modules/searchEngine/indexer/Indexer';
import { IIndexer } from '../../../modules/searchEngine/indexer/IIndexer';
import { workspace } from '../../../workspace/Workspace';
import { BlackListKeyWordIndex } from '../../../workspace/tree/blackList/BlackListKeyWordIndex';
import { QueryBuilderCreator } from '../../../model/queryBuilder/QueryBuilderCreator';
import { Project } from '../../../workspace/Project';
import { ScannerStage } from '../../../../api/types';

export class IndexTask implements Scanner.IPipelineTask {
  private project: Project;

  constructor(project: Project) {
    this.project = project;
  }

  public getStageProperties(): Scanner.StageProperties {
    return {
      name: ScannerStage.SEARCH_INDEX,
      label: i18next.t('Title:CreatingSearchIndex'),
      isCritical: false,
    };
  }

  public async run(): Promise<boolean> {
    log.info('[ IndexTask init ]');
    const project = workspace.getOpenProject();
    if (!project) throw new Error('Not project opened');

    const RESOURCES_PATH = app.isPackaged
      ? path.join(__dirname, 'scanner.js')
      : path.join(app.getAppPath(), '.erb/dll/scanner.js');

    const child = utilityProcess.fork(RESOURCES_PATH, [], { stdio: 'pipe' });

    child.stdout.on('data', (data) => {
      log.info('%c[ THREAD ]: Index Thread ', 'color: green', data.toString());
    });

    child.stderr.on('data', (data) => {
      log.info('%c[ THREAD ]: Index Thread ', 'color: green', data.toString());
    });

    const f = this.project
      .getTree()
      .getRootFolder()
      .getFiles(new BlackListKeyWordIndex());

    const paths = f.map((fi) => `'${fi.path}'`).join(', ');

    const files = await modelProvider.model.file.getAll(
      QueryBuilderCreator.create({ paths }),
    );

    const scanRoot = this.project.metadata.getScanRoot();

    child.postMessage({ action: 'SEARCH_INDEX', data: { projectPath: this.project.metadata.getMyPath(), scanRoot, files } });

    return new Promise((resolve, reject) => {
      child.on('message', (data) => {
        log.info('%c[ THREAD ]: Index Thread ', 'color: green', data.toString());
        if (data.event === 'success') {
          this.project.save();
          resolve(true);
        } else reject(new Error('Index task failed'));
        child.kill();
      });
    });
  }

  private fileAdapter(files: any, scanRoot: string): Array<IIndexer> {
    const filesToIndex = [];
    files.forEach((file: any) => {
      filesToIndex.push({ fileId: file.id, path: `${scanRoot}${file.path}` });
    });
    return filesToIndex;
  }

  /*const indexer = new Indexer();
  const filesToIndex = this.fileAdapter();
  const index = indexer.index(filesToIndex);
  await indexer.saveIndex(index, `${this.projectPath}/dictionary/`);*/
}
