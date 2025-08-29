export default function MapLayout({ children }: { children: React.ReactNode }) {
  // Custom layout for map page that uses fixed positioning
  // to fill the exact space between header and footer
  return <div className="fixed inset-0 top-[4.5rem] bottom-[49px]">{children}</div>;
}
