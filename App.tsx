import {useEffect} from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {RootNavigator} from './src/navigation/RootNavigator';
import {hydrateQueue} from './src/upload/queue';
import {startUploader} from './src/upload/uploader';

export default function App() {
  useEffect(() => {
    let stopUploader: (() => void) | undefined;

    hydrateQueue()
      .catch(() => {})
      .finally(() => {
        stopUploader = startUploader();
      });

    return () => {
      stopUploader?.();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <RootNavigator />
    </SafeAreaProvider>
  );
}
