
export default function ServicesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="pt-0">
            {/* We can add specific layout elements for services here if needed, 
          like a specific sub-nav or breadcrumbs context */}
            {children}
        </div>
    );
}
