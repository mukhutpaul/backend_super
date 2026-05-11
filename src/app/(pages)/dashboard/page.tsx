import DashboardCards from "@/components/dashboard/DashboardCards";
import PoliceChart from "@/components/dashboard/police-chart";
import DashboardLayout from "@/components/layout/dashboard-layout";


export default function DashboardPage() {
    
    return (
        <DashboardLayout>
            <div className="py-5 space-y-8">
                <DashboardCards />
                {/* <PoliceChart /> */}
            </div>
        </DashboardLayout>

    );
}