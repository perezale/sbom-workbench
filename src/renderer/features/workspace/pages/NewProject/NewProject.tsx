import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { IconButton, LinearProgress } from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import CloseIcon from '@material-ui/icons/Close';
import { AppContext } from '../../../../context/AppProvider';
import * as controller from '../../../../home-controller';
import { IpcEvents } from '../../../../../ipc-events';
import { DialogContext } from '../../../../context/DialogProvider';
import { projectService } from '../../../../../api/project-service';

const { ipcRenderer } = require('electron');

const NewProject = () => {
  const history = useHistory();

  const { scanPath, setScanPath } = useContext(AppContext) as IAppContext;
  const [projectName, setProjectName] = useState<string>();
  const [progress, setProgress] = useState<number>(0);
  const [stage, setStage] = useState<string>('');
  const dialogCtrl = useContext<any>(DialogContext); // ??

  const init = async () => {
    ipcRenderer.on(IpcEvents.SCANNER_UPDATE_STATUS, handlerScannerStatus);
    ipcRenderer.on(IpcEvents.SCANNER_FINISH_SCAN, handlerScannerFinish);
    ipcRenderer.on(IpcEvents.SCANNER_ERROR_STATUS, handlerScannerError);

    try {
      const { path, action } = scanPath;
      setProjectName(path.split('/')[path.split('/').length - 1]);

      if (action === 'resume') controller.resume(path);
      else controller.scan(path);
    } catch (e) {
      console.log(e);
    }
  };

  const cleanup = () => {
    ipcRenderer.removeListener(IpcEvents.SCANNER_UPDATE_STATUS, handlerScannerStatus);
    ipcRenderer.removeListener(IpcEvents.SCANNER_FINISH_SCAN, handlerScannerFinish);
    ipcRenderer.removeListener(IpcEvents.SCANNER_ERROR_STATUS, handlerScannerError);
  };

  const onShowScan = (path) => {
    setScanPath({ path, action: 'none' });
    history.push('/workbench/report');
  };

  const handlerScannerStatus = (_event, args) => {
    setProgress(args.processed);
    setStage(args.stage);
  };

  const handlerScannerError = async (_event, args) => {
    console.log(args);
    // alert(args);
    const errorMessage = `An error occurred while scanning. Please try again`;//args.message;
    const { action } = await dialogCtrl.openConfirmDialog(
      `${errorMessage}`,
      {
        label: 'OK',
        role: 'accept',
      },
      true
      );
      history.goBack();


    //ipcRenderer.send(IpcEvents.SCANNER_RESUME);


  }

  const onCancelHandler = async (_event) => {
    console.log("Button pressed");

    const { action } = await dialogCtrl.openConfirmDialog(
      `Are you sure you want to stop the scanner?`,
      {
        label: 'OK',
        role: 'accept',
      },
      false
      );
      if(action === 'ok') {
        // Call to the service and stop scanner.
        await projectService.stop();
        history.goBack();
      }

    //ipcRenderer.send(IpcEvents.PROJECT_STOP);

  }

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
            {stage === 'preparing' && (
              <>
                <LinearProgress variant="indeterminate" />
                <div className="stage-label"> {stage} </div>
              </>
            )}

            {stage === 'indexing' && (
              <>
                <LinearProgress variant="indeterminate" />
                <div className="stage-label">
                  {' '}
                  {stage} ({progress}){' '}
                </div>
              </>
            )}

            {stage === 'scanning' && (
              <>
                <LinearProgress variant="determinate" value={progress} />
                <div className="stage-label"> {stage} </div>
              </>
            )}

            {stage === 'resuming' && (
              <>
                <LinearProgress variant="determinate" value={progress} />
                <div className="stage-label"> RESUMING SCANNER </div>
              </>
            )}

            <IconButton
              aria-label="cancel-scan"
              className="btn-cancel"
              onClick={(event) => onCancelHandler(event)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>
        </main>
      </section>
    </>
  );
};

export default NewProject;