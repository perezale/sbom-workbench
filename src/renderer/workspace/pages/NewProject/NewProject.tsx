import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { IconButton, LinearProgress } from '@material-ui/core';

import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { AppContext } from '../../../context/AppProvider';

import * as controller from '../../../home/HomeController';

import { IpcEvents } from '../../../../ipc-events';

const { ipcRenderer } = require('electron');

const NewProject = () => {
  const history = useHistory();

  const { scanPath, setScanPath } = useContext<any>(AppContext);
  const [projectName, setProjectName] = useState<string>();
  const [progress, setProgress] = useState<number>(0);
  const [stage, setStage] = useState<string>('');

  const init = async () => {
    ipcRenderer.on(IpcEvents.SCANNER_UPDATE_STATUS, handlerScannerStatus);
    ipcRenderer.on(IpcEvents.SCANNER_FINISH_SCAN, handlerScannerFinish);

    try {
      setProjectName(scanPath.split('/')[scanPath.split('/').length - 1]);
      controller.scan(scanPath);
    } catch (e) {
      console.log(e);
    }
  };

  const cleanup = () => {
    ipcRenderer.removeListener(IpcEvents.SCANNER_UPDATE_STATUS, handlerScannerStatus);
    ipcRenderer.removeListener(IpcEvents.SCANNER_FINISH_SCAN, handlerScannerFinish);
  };

  const onShowScan = (path) => {
    setScanPath(path);
    history.push('/workbench');
  };

  const handlerScannerStatus = (_event, args) => {
    setProgress(args.completed);
    setStage(args.stage);
  };

  const handlerScannerFinish = (_event, args) => {
    if (args.success) {
      onShowScan(args.resultsPath);
    } else {
      // showError();
    }
  };

  useEffect(() => {
    init();
    return cleanup;
  }, []);

  return (
    <>
      <section id="NewProject" className="app-page">
        <header className="app-header">
          <div>
            <h4 className="header-subtitle back">
              <IconButton onClick={() => history.goBack()} component="span">
                <ArrowBackIcon />
              </IconButton>
              SCANNING
            </h4>
            <h1>{projectName}</h1>
          </div>
        </header>
        <main className="app-content">
          <div className="progressbar">
            {stage === 'scanning' ? (
              <LinearProgress variant="determinate" value={progress} />
            ) : (
              <LinearProgress variant="indeterminate" />
            )}
          </div>
          <div className="stage-label"> {stage} </div>
        </main>
      </section>
    </>
  );
};

export default NewProject;