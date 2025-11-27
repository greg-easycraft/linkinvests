import { PageHeader } from "./_components/PageHeader";


export default function ProtectedLayout({ children }: { children: React.ReactNode }): React.ReactElement {
    return (
        <div className="min-h-screen flex flex-col">
            <PageHeader />
            {children}
        </div>
    );
}