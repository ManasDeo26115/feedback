import { useState } from 'react';

export const useIdentity = () => {
  const [userId, setUserId] = useState(() => localStorage.getItem('pm_user_id') || '');
  const [profileName, setProfileName] = useState(() => localStorage.getItem('pm_user_name') || '');

  const saveIdentity = (id, name) => {
    localStorage.setItem('pm_user_id', id);
    localStorage.setItem('pm_user_name', name);
    setUserId(id);
    setProfileName(name);
  };

  const clearIdentity = () => {
    localStorage.removeItem('pm_user_id');
    localStorage.removeItem('pm_user_name');
    setUserId('');
    setProfileName('');
  };

  return {
    userId,
    profileName,
    saveIdentity,
    clearIdentity,
    hasIdentity: !!userId,
  };
};
