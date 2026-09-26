import { redirect } from 'next/navigation';
import { apiFetch, mockManagementYears, type ManagementYear } from '../utils/api';

export default async function OrganisasiRootPage() {
  const years = await apiFetch<ManagementYear[]>('/management-years', mockManagementYears);

  // Sort chronologically descending so the most recent period comes first
  const sortedYears = [...years].sort((a, b) => {
    const endDiff = (b.end_year ?? 0) - (a.end_year ?? 0);
    if (endDiff !== 0) return endDiff;
    const startDiff = (b.start_year ?? 0) - (a.start_year ?? 0);
    if (startDiff !== 0) return startDiff;
    return (b.slug || '').localeCompare(a.slug || '');
  });

  const latestYear = sortedYears[0]?.slug || '2026-2027';

  redirect(`/organisasi/${latestYear}`);
}
