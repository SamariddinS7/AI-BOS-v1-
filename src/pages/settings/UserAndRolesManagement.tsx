import React from 'react';
import { UserManagement, RolesManagement } from '../Admin';

export default function UserAndRolesManagement() {
  return (
    <div className="space-y-12">
      <UserManagement />
      <hr className="border-border-dark" />
      <RolesManagement />
    </div>
  );
}
