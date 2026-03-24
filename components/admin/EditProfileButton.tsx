'use client';

import { useState } from 'react';
import EditButton from './EditButton';
import EditorPanel from './EditorPanel';
import ProfileEditor from './ProfileEditor';
import { DbProfile } from '@/lib/db/types';

export default function EditProfileButton({ profile }: { profile: DbProfile }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <EditButton onClick={() => setOpen(true)} className="static inline-flex" />
      <EditorPanel open={open} onClose={() => setOpen(false)} title="Edit Profile">
        <ProfileEditor profile={profile} onClose={() => setOpen(false)} />
      </EditorPanel>
    </>
  );
}
