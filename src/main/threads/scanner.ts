/**
 * Entry point of scanner subprocess
 */
import { DecompressThread } from './scanner/DecompressThread';
import { SearchIndexThread } from './scanner/SearchIndexTheread';

process.parentPort.once('message', async (e) => {
  // const [port] = e.ports;
  const { action, data } = e.data;

  console.log('CHILD PROCESS', data, action);

  if (action === 'DECOMPRESS') {
    const decompressThread = new DecompressThread(data);
    const success = await decompressThread.run();
    process.parentPort.postMessage({
      event: success ? 'success' : 'error',
      data: success,
    });
  }
  if (action === 'SEARCH_INDEX') {
    console.log('SEARCH INDEX CHILD PROCESS');
    const searchIndexThread = new SearchIndexThread(data);
    await searchIndexThread.run();
    const success = true;
    process.parentPort.postMessage({
      event: success ? 'success' : 'error',
      data: success,
    });
  }
});
