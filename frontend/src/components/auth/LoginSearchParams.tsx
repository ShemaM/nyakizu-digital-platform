'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginParamsHandler() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  
  return (
    <input type="hidden" name="redirect" value={redirect} />
  );
}

export function LoginSearchParams() {
  return (
    <Suspense fallback={null}>
      <LoginParamsHandler />
    </Suspense>
  );
}
