import { Suspense } from 'react';
import { PaymentsContent } from './_components/payments-content';

export default function PaymentsPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <PaymentsContent />
    </Suspense>
  );
}
