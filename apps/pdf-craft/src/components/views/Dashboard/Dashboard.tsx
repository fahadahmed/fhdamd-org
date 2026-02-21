'use client';
import './dashboard.css'
import { useEffect, useState } from 'react';
import { db, auth } from '../../../firebase/client';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { UserFileList, OperationsContainer } from '../../slices';
import { Heading } from '../../ui';

export default function Dashboard() {
  const [files, setFiles] = useState<any[]>([]);
  const [profile, setProfile] = useState<{ name?: string; credits?: number; isSubscriber?: boolean }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const filesRef = collection(db, 'users', user.uid, 'files');
          const snapshot = await getDocs(filesRef);
          setFiles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

          // Fetch profile
          const profileRef = doc(db, 'users', user.uid);
          const profileSnap = await getDoc(profileRef);
          if (profileSnap.exists()) {
            const data = profileSnap.data();
            if (data.profile) {
              setProfile(data.profile);
            }
          }
        } catch (error) {
          console.error('Error fetching files:', error);
          setFiles([]);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="dashboard-container">
      <div className='dashboard-header'>
        <div>
          <Heading level='h1' variant='page'>Welcome, {profile.name ? `${profile.name}` : ''}</Heading>
          <p>Manage your PDF files and operations here.</p>
        </div>
        <div>
          {profile.credits !== undefined && (
            <p><strong>Available Credits:</strong> {profile.credits}</p>
          )}
        </div>
      </div>
      <div className="dashboard-tasks">
        <Heading level='h3' variant="subsection">Tasks</Heading>
        <OperationsContainer />
      </div>
      <div className="dashboard-files">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <UserFileList files={files} />
        )}
      </div>
    </div>
  );
}