import React from 'react';
import BaseNavbar from './BaseNavbar';

function GuestNavbar() {
  return <BaseNavbar links={[]} dropdowns={[]} user={null} onLogout={() => {}} />;
}

export default GuestNavbar;