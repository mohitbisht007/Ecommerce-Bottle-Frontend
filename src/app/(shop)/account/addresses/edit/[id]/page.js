"use client";

import dynamic from 'next/dynamic';

// This is the ONLY way to completely stop the build worker from executing your component
const AddressFormPage = dynamic(
  () => import('@/app/(shop)/components/AddressForm'),
  { 
    ssr: false,
    loading: () => <div className="loading-state">Loading Form...</div> 
  }
);

export default function AddAddressPage() {
  return <AddressFormPage />;
}