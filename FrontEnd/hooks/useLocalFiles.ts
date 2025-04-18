import { useState, useEffect } from 'react';
import { setupLocalFiles } from '../utils/localfiles';

export default function useLocalFiles(): string|null|undefined {
  const [dir, setDir] = useState<string|null>();

  useEffect(() => {
    setupLocalFiles()
      .then((localDir) => {setDir(localDir);})
      .catch((error) => {console.error('Failed to prepare local dir', error);});
  }, []);

  return dir;
}