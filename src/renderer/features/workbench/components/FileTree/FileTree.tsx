import { ipcRenderer } from 'electron';
import React, { useContext, useState, useEffect } from 'react';
import CheckboxTree, { OnCheckNode } from 'react-checkbox-tree';
import { useHistory } from 'react-router-dom';
import { IpcEvents } from '../../../../../ipc-events';
import useContextual from '../../../../hooks/useContextual';
import { IWorkbenchContext, WorkbenchContext } from '../../store';

const electron = window.require('electron');
const { remote } = electron;
const { Menu, MenuItem } = remote;

export const FileTree = () => {
  const history = useHistory();
  const contextual = useContextual();

  const { state } = useContext(WorkbenchContext) as IWorkbenchContext;
  const { tree, filter, file } = state;

  const [renderTree, setRenderTree] = useState([]);
  const [expanded, setExpanded] = useState<string[]>([renderTree && renderTree[0] ? renderTree[0].value : '']);

  const onSelectFile = async (node: OnCheckNode) => {
    const { children, value } = node;

    const fileTreeNode = getNode(node);

    if (!children) {
      history.push({
        pathname: '/workbench/detected/file',
        search: `?path=file|${encodeURIComponent(value)}`,
      });
    } else {
      history.push({
        pathname: '/workbench/detected',
        search: fileTreeNode ? `?path=folder|${encodeURIComponent(fileTreeNode.value)}` : null,
      });
    }
  };

  const getNode = (target) => {
    const node = target.parent.children?.find((el) => el.value === target.value);
    return node;
  };

  const onContextMenu = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>, node: OnCheckNode | any) => {
    const onlyRestore = node.status === 'IDENTIFIED' || node.status === 'IGNORED';
    const menu = !node.children
      ? [
          /* {
            label: 'Identify file',
            click: () => contextual.identifyAll(node),
            enabled: !onlyRestore,
          }, */
          {
            label: 'Mark file as original',
            click: () => contextual.ignore(node),
            enabled: !onlyRestore && node.status !== 'FILTERED' && node.status !== 'NO-MATCH',
          },
          {
            label: 'Restore file',
            click: () => contextual.restore(node),
            enabled: onlyRestore,
          },
        ]
      : [
          {
            label: 'Accept all',
            click: () => contextual.acceptAll(node),
            enabled: !onlyRestore,
          },
          { type: 'separator' },
          {
            label: 'Identify all files as...',
            click: () => contextual.identifyAll(node),
            enabled: !onlyRestore,
          },
          {
            label: 'Mark all files as original',
            click: () => contextual.ignoreAll(node),
            enabled: !onlyRestore,
          },
          { type: 'separator' },
          {
            label: 'Restore all files',
            click: () => contextual.restoreAll(node),
          },
        ];

    Menu.buildFromTemplate(menu).popup(remote.getCurrentWindow());
  };

  useEffect(() => {
    document.querySelectorAll('.rct-text.selected').forEach((el) => el.classList.remove('selected'));
    if (!filter.node?.path && !file) {
      document.querySelector('.react-checkbox-tree .rct-text')?.classList.add('selected');
      return;
    }

    const value = filter.node?.path || file;
    const node = document.querySelector(`[data-value="${value}"]`);
    node?.closest('.rct-text')?.classList.add('selected');
  }, [filter.node, file, renderTree]);

  useEffect(() => {
    if (tree) {
      const t = { ...tree };
      setRenderTree([preRender(t)]);
    }
  }, [tree]);

  const preRender = (node: any) => {
    node.label = (
      <div onContextMenu={(e) => onContextMenu(e, node)} data-value={node.value}>
        {node.label}
      </div>
    );
    if (node.children) {
      node.children.forEach((el) => preRender(el));
    }
    return node;
  };

  return (
    <>
      {tree ? (
        <CheckboxTree
          nodes={renderTree || []}
          expanded={expanded}
          onClick={(targetNode) => onSelectFile(targetNode)}
          onExpand={(expandedItems) => setExpanded(expandedItems)}
        />
      ) : (
        <div className="loader">
          <span>Indexing...</span>
        </div>
      )}
    </>
  );
};

export default FileTree;
