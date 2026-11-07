import type { KeyedMutator } from 'swr';
import type { DashboardData } from '../../dashboard/dashboardApi';
import type { NavigationTab } from '../../types';
import type { SessionState, SessionUser } from './hooks';

/** What every section needs; one dashboard request is made by the shell and shared. */
export type SectionCtx = {
  sessionState: SessionState;
  user: SessionUser | null;
  data: DashboardData | undefined;
  error: Error | undefined;
  isLoading: boolean;
  mutate: KeyedMutator<DashboardData>;
  openModule: (tab: NavigationTab) => void;
  goSection: (id: string) => void;
  openAuth: () => void;
};
