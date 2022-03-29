import { QueryBuilderCreator } from '../../../../queryBuilder/QueryBuilderCreator';
import { serviceProvider } from '../../../../services/ServiceProvider';
import Node from '../Node';
import { TreeViewMode } from './TreeViewMode';

export abstract class TreeViewFilter extends TreeViewMode {
  private filter: any;

  constructor(filter: any) {
    super();
    this.filter = filter;
  }

  public async getFiles(): Promise <Record<string, number>> {
    let files: any = await serviceProvider.model.file.getAll(
      QueryBuilderCreator.create({ ...this.filter, path: null })
    );
    files = files.reduce((acc: any, curr: any) => {
      if (!acc[curr.path]) acc[curr.path] = curr.id;
      return acc;
    }, {});
    return files;
  }

  public abstract getTree(node: Node): Promise<Node>;
}