
import ResponsiveLayout from './ResponsiveLayout';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return <ResponsiveLayout>{children}</ResponsiveLayout>;
};

export default Layout;
