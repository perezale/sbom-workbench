import { Indexer } from 'main/modules/searchEngine/indexer/Indexer';
import { IIndexer } from '../../modules/searchEngine/indexer/IIndexer';
import { getSearchConfig } from '../../../shared/utils/search-utils';

export class SearchIndexThread {
  private projectPath: string;

  private scanRoot: string;

  private files: Array<any>;

  constructor(params: { projectPath: string, scanRoot: string, files: Array<any> }) {
    this.projectPath = params.projectPath;
    this.scanRoot = params.scanRoot;
    this.files = params.files;
  }

  public async run() {
    try {
      console.log('INDEX THREAD');
      console.log(this.projectPath);
      console.log(this.files);
      console.log(this.scanRoot);
      const indexer = new Indexer();
      const filesToIndex = this.fileAdapter();
      const index = indexer.index(filesToIndex);
      await indexer.saveIndex(index, `${this.projectPath}/dictionary/`);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  private fileAdapter(): Array<IIndexer> {
    const filesToIndex = [];
    this.files.forEach((file: any) => {
      filesToIndex.push({ fileId: file.id, path: `${this.scanRoot}${file.path}` });
    });
    return filesToIndex;
  }
}
