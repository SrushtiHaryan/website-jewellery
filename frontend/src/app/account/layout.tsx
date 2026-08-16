import { AccountLayout } from '@/components/account/AccountLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AccountLayout>{children}</AccountLayout>;
}
