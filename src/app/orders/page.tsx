import { PageHeader } from "@/components/page-header";
import { OrdersTable } from "@/components/orders-table";
import { ORDERS } from "@/lib/placeholder-data";
import { Card, CardContent } from "@/components/ui/card";

export default function OrdersPage() {
    return (
        <div className="container mx-auto max-w-6xl px-4 py-8 sm:py-12">
            <PageHeader
                title="My Orders"
                description="View your recent data bundle purchases and their status."
            />
            <div className="mt-8">
                <Card>
                    <CardContent className="p-4 sm:p-6">
                        <OrdersTable data={ORDERS} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
