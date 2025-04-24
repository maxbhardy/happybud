import { useState, useEffect } from 'react';
import { setupLocalFiles, replaceLocalFiles } from '../utils/localfiles';

export default function useLocalFiles(replace?: boolean): string|null|undefined {
  const [dir, setDir] = useState<string|null>();

  // If undefined, use false by default
  replace = replace === undefined ? false : replace;
  
  if (replace) {
    useEffect(() => {
      replaceLocalFiles()
        .then((localDir) => {setDir(localDir);})
        .catch((error) => {console.error('Failed to prepare local dir', error);});
    }, []);
  }
  else {
    useEffect(() => {
      setupLocalFiles()
        .then((localDir) => {setDir(localDir);})
        .catch((error) => {console.error('Failed to prepare local dir', error);});
    }, []);
  }

  return dir;
}