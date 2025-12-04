import Link from "next/link";
import Button from "@/components/ui/Button";

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <Link href="/login">
                        <Button variant="outline" size="sm">
                            Sign Out
                        </Button>
                    </Link>
                </div>

                <div className="p-8 border border-white/10 rounded-2xl bg-white/5 border-dashed flex items-center justify-center h-64 text-gray-500">
                    Dashboard Content Placeholder
                </div>
            </div>
        </div>
    );
}
