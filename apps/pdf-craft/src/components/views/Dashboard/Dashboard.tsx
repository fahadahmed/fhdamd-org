'use client';
import { useEffect, useState } from 'react';
import { db, auth } from '../../../firebase/client';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { Container, Stack, Text, Badge, Tabs, type TabItem } from '@fhdamd/threads';
import { OperationsContainer } from '../../slices';
import { UserFileList } from '../../slices';
import type { Operation } from '../../../utils';

export default function Dashboard({ operations }: { operations: Operation[] }) {
  const [files, setFiles]     = useState<any[]>([]);
  const [profile, setProfile] = useState<{ name?: string; credits?: number; isSubscriber?: boolean }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const filesRef  = collection(db, 'users', user.uid, 'files');
          const snapshot  = await getDocs(filesRef);
          setFiles(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));

          const profileRef  = doc(db, 'users', user.uid);
          const profileSnap = await getDoc(profileRef);
          if (profileSnap.exists()) {
            const data = profileSnap.data();
            if (data.profile) setProfile(data.profile);
          }
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
          setFiles([]);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const tabItems: TabItem[] = [
    {
      id: 'files',
      label: 'Files',
      content: <UserFileList files={files.filter(f => !f.deleted)} />,
    },
    {
      id: 'history',
      label: 'History',
      content: <UserFileList files={files.filter(f => f.deleted)} mode="trash" />,
    },
  ];

  return (
    <Container>
      <Stack gap={8} style={{ paddingBlock: 'var(--th-space-8)' }}>

        {/* ── Page header ───────────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--th-space-4)' }}>
          <Stack gap={2}>
            <Text as="h1" size="3xl" color="1" weight={650} width={90}>
              Welcome{profile.name ? `, ${profile.name}` : ''}
            </Text>
            <Text as="p" size="sm" color="2">
              Manage your PDF files and operations below.
            </Text>
          </Stack>

          {profile.credits !== undefined && (
            <Badge variant="terra">
              {profile.credits} {profile.credits === 1 ? 'credit' : 'credits'} remaining
            </Badge>
          )}
        </div>

        {/* ── Operations ────────────────────────────────────────────────── */}
        <Stack gap={4}>
          <Text as="h2" size="lg" color="1" weight={600} width={90}>
            Tools
          </Text>
          <OperationsContainer operations={operations} activeOnly />
        </Stack>

        {/* ── Files ─────────────────────────────────────────────────────── */}
        <Stack gap={4}>
          <Text as="h2" size="lg" color="1" weight={600} width={90}>
            Your files
          </Text>
          {loading ? (
            <Text color="2" size="sm">Loading your files...</Text>
          ) : (
            <Tabs items={tabItems} defaultActiveId="files" ariaLabel="File views" />
          )}
        </Stack>

      </Stack>
    </Container>
  );
}
