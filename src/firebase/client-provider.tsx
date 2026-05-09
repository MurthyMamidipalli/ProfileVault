'use client';

import React, { useMemo } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider, setFirebaseInstances } from './provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const instances = useMemo(() => {
    const i = initializeFirebase();
    setFirebaseInstances(i.app, i.firestore, i.auth);
    return i;
  }, []);

  return (
    <FirebaseProvider
      app={instances.app}
      firestore={instances.firestore}
      auth={instances.auth}
    >
      <FirebaseErrorListener />
      {children}
    </FirebaseProvider>
  );
}
