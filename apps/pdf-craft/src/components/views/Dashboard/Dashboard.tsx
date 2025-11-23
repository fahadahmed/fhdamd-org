'use client';
import './dashboard.css'
import { useEffect, useState } from 'react';
import { db, auth } from '../../../firebase/client';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { UserFileList } from '../../slices';

const tasks = [
  { name: 'Merge PDFs', link: '/mergepdf' },
  { name: 'Split PDF', link: '/splitpdf' },
  { name: 'Sign PDF', link: '/esignpdf' },
  { name: 'Summarise PDF', link: '/summarisepdf' },
];

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

  console.log('User profile:', profile);
  return (
    <div className="dashboard-container">
      <div className='dashboard-header'>
        <div>
          <h1>Welcome, {profile.name ? `${profile.name}` : ''}</h1>
          <p>Manage your PDF files and operations here.</p>
        </div>
        <div>
          {profile.credits !== undefined && (
            <p><strong>Available Credits:</strong> {profile.credits}</p>
          )}
          <button>Buy Credits</button>
        </div>
      </div>
      <div>
        <h2>Tasks</h2>
        <div className="task-container">
          {tasks.map((task) => (
            <div key={task.name} className="task-tile">
              <a href={task.link}><strong>{task.name}</strong></a>
            </div>
          ))}
        </div>
      </div>
      <div>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <UserFileList files={files} />
        )}
      </div>
    </div>
  );
}