import { useEffect, useMemo, useState } from 'react';
import Dashboard2 from '../dashboard-2-nextjs/app/(dashboard)/dashboard/page';
import UsersPage from '../dashboard-2-nextjs/app/(dashboard)/users/page';
import TasksPage from '../dashboard-2-nextjs/app/(dashboard)/tasks/page';
import CalendarPage from '../dashboard-2-nextjs/app/(dashboard)/calendar/page';
import MailPage from '../dashboard-2-nextjs/app/(dashboard)/mail/page';
import AccountSettings from '../dashboard-2-nextjs/app/(dashboard)/settings/account/page';
import logoUrl from '../../assets/uniwave-logo.png';

type AdminSection = 'dashboard' | 'users' | 'tasks' | 'calendar' | 'mail' | 'settings';

const adminNav: Array<{ label: string; section: AdminSection; href: string }> = [
  { label: 'Dashboard', section: 'dashboard', href: '#admin' },
  { label: 'Users', section: 'users', href: '#admin/users' },
  { label: 'Tasks', section: 'tasks', href: '#admin/tasks' },
  { label: 'Calendar', section: 'calendar', href: '#admin/calendar' },
  { label: 'Mail', section: 'mail', href: '#admin/mail' },
  { label: 'Settings', section: 'settings', href: '#admin/settings' },
];

function getAdminSectionFromLocation(): AdminSection {
  if (typeof window === 'undefined') return 'dashboard';

  const hashSection = window.location.hash.replace(/^#admin\/?/, '').split('/')[0];
  const pathSection = window.location.pathname.replace(/^\/admin\/?/, '').split('/')[0];
  const section = hashSection || pathSection;

  if (section === 'users' || section === 'tasks' || section === 'calendar' || section === 'mail' || section === 'settings') {
    return section;
  }

  return 'dashboard';
}

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<AdminSection>(getAdminSectionFromLocation);

  useEffect(() => {
    const handleRouteChange = () => setActiveSection(getAdminSectionFromLocation());
    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);
    handleRouteChange();

    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  const ActivePage = useMemo(() => {
    switch (activeSection) {
      case 'users':
        return UsersPage;
      case 'tasks':
        return TasksPage;
      case 'calendar':
        return CalendarPage;
      case 'mail':
        return MailPage;
      case 'settings':
        return AccountSettings;
      default:
        return Dashboard2;
    }
  }, [activeSection]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r bg-sidebar px-4 py-5 text-sidebar-foreground lg:flex lg:flex-col">
          <a href="/#home" className="mb-8 flex items-center gap-3 px-2 text-lg font-semibold">
            <img src={logoUrl} alt="UniWave" className="h-10 w-10 rounded-xl object-contain" />
            UniWave Admin
          </a>

          <nav className="flex flex-col gap-1 text-sm">
            {adminNav.map((item) => (
              <a
                key={item.section}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-left transition-colors ${
                  activeSection === item.section ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <a href="/#signin" className="mt-auto rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent">
            Back to login
          </a>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b bg-background/90 px-4 py-3 backdrop-blur md:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 lg:hidden">
                <img src={logoUrl} alt="UniWave" className="h-9 w-9 rounded-xl object-contain" />
                <span className="font-semibold">UniWave Admin</span>
              </div>
              <a href="/#signin" className="ml-auto rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted">
                Back to login
              </a>
            </div>
            <nav className="mt-3 flex gap-2 overflow-x-auto text-sm lg:hidden">
              {adminNav.map((item) => (
                <a
                  key={item.section}
                  href={item.href}
                  className={`shrink-0 rounded-lg border px-3 py-2 ${
                    activeSection === item.section ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </header>

          <div className="py-6">
            <ActivePage />
          </div>
        </section>
      </div>
    </main>
  );
}
