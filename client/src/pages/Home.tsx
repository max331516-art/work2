import { useState } from "react";
import { RoleSwitcher, Role } from "@/components/RoleSwitcher";
import { CreateRequestForm } from "@/components/CreateRequestForm";
import { RequestCard } from "@/components/RequestCard";
import { useRequests } from "@/hooks/use-requests";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Inbox, Archive, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [role, setRole] = useState<Role>("foreman");
  const { data: requests, isLoading } = useRequests();

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground">
          <Loader2 className="h-12 w-12 animate-spin mb-4 text-primary" />
          <p className="font-display tracking-widest uppercase">Loading Logistics Data...</p>
        </div>
      );
    }

    if (role === "foreman") {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto space-y-8"
        >
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <h2 className="text-xl font-bold font-display mb-6 border-b pb-2">New Request</h2>
            <CreateRequestForm />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Recent Requests</h3>
            {requests?.filter(r => r.createdById === 1).slice(0, 3).map(req => ( // Hardcoded ID 1 for demo
              <RequestCard key={req.id} request={req} role="foreman" />
            ))}
          </div>
        </motion.div>
      );
    }

    if (role === "supplier") {
      const newRequests = requests?.filter(r => r.status === "new") || [];
      const inProgressRequests = requests?.filter(r => r.status === "in_progress") || [];
      const completedRequests = requests?.filter(r => r.status === "completed") || [];

      return (
        <div className="max-w-md mx-auto h-full">
          <Tabs defaultValue="new" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50 p-1">
              <TabsTrigger value="new" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
                New
                {newRequests.length > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[1.25rem]">
                    {newRequests.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="active" className="data-[state=active]:bg-white">Active</TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-white">History</TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent value="new" className="space-y-4 focus-visible:outline-none">
                {newRequests.length === 0 ? (
                  <EmptyState icon={Inbox} text="No new requests" />
                ) : (
                  newRequests.map(req => (
                    <motion.div key={req.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <RequestCard request={req} role="supplier" />
                    </motion.div>
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="active" className="space-y-4 focus-visible:outline-none">
                {inProgressRequests.length === 0 ? (
                  <EmptyState icon={Clock} text="No active deliveries" />
                ) : (
                  inProgressRequests.map(req => (
                    <motion.div key={req.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <RequestCard request={req} role="supplier" />
                    </motion.div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="history" className="space-y-4 focus-visible:outline-none">
                {completedRequests.length === 0 ? (
                  <EmptyState icon={Archive} text="No history yet" />
                ) : (
                  completedRequests.map(req => (
                    <motion.div key={req.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <RequestCard request={req} role="supplier" />
                    </motion.div>
                  ))
                )}
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </div>
      );
    }

    if (role === "driver") {
      // In real app, filter by assigned driverId. Here we show all active for demo or assigned to ID 3
      const myDeliveries = requests?.filter(r => r.status === "in_progress") || []; // showing all active for demo visibility
      const todayDeliveries = myDeliveries.filter(r => {
        const d = new Date(r.deliveryDate);
        const now = new Date();
        return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });

      return (
        <div className="max-w-md mx-auto space-y-6">
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
            <h3 className="text-primary font-bold font-display uppercase text-sm tracking-wider mb-1">Active Route</h3>
            <p className="text-2xl font-bold">{todayDeliveries.length} stops today</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">Tasks</h3>
            {myDeliveries.length === 0 ? (
              <EmptyState icon={Truck} text="No deliveries assigned" />
            ) : (
              myDeliveries.map(req => (
                <RequestCard key={req.id} request={req} role="driver" />
              ))
            )}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <RoleSwitcher currentRole={role} onRoleChange={setRole} />
      <main className="container mx-auto px-4 py-6">
        {renderContent()}
      </main>
    </div>
  );
}

function EmptyState({ icon: Icon, text }: { icon: any, text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-xl bg-muted/20">
      <Icon className="h-12 w-12 mb-3 opacity-50" />
      <p className="font-medium">{text}</p>
    </div>
  );
}
