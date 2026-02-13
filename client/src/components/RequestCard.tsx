import { Request, User } from "@shared/schema";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  CalendarIcon, 
  MapPin, 
  Package, 
  Truck, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";
import { useUpdateRequest } from "@/hooks/use-requests";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useUsers } from "@/hooks/use-users";

interface RequestCardProps {
  request: Request;
  role: "foreman" | "supplier" | "driver";
}

export function RequestCard({ request, role }: RequestCardProps) {
  const { mutate, isPending } = useUpdateRequest();
  const { data: users } = useUsers();
  const [driverId, setDriverId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  // Filter drivers for assignment
  const drivers = users?.filter(u => u.role === "driver") || [];

  const handleAssign = () => {
    if (!driverId) return;
    mutate({ 
      id: request.id, 
      status: "in_progress", 
      driverId: parseInt(driverId) 
    }, {
      onSuccess: () => setIsOpen(false)
    });
  };

  const handleComplete = () => {
    mutate({ 
      id: request.id, 
      status: "completed" 
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "new": return "НОВЫЙ";
      case "in_progress": return "В ПУТИ";
      case "completed": return "ДОСТАВЛЕНО";
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-red-500 hover:bg-red-600";
      case "in_progress": return "bg-blue-500 hover:bg-blue-600";
      case "completed": return "bg-green-500 hover:bg-green-600";
      default: return "bg-gray-500";
    }
  };

  const isUrgent = new Date(request.deliveryDate) <= new Date() && request.status !== "completed";

  return (
    <Card className={`overflow-hidden border-0 shadow-md relative group transition-all hover:shadow-lg ${isUrgent ? 'ring-2 ring-red-500/50' : ''}`}>
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${getStatusColor(request.status)}`} />
      
      <CardHeader className="pb-2 pt-4 pl-5">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className={`mb-2 font-mono uppercase text-[10px] tracking-wider ${request.status === 'new' ? 'bg-red-50 text-red-700 border-red-200' : ''}`}>
            {getStatusLabel(request.status)}
          </Badge>
          <span className="text-xs text-muted-foreground font-mono">
            #{request.id.toString().padStart(4, '0')}
          </span>
        </div>
        <CardTitle className="text-xl font-bold font-display leading-tight">
          {request.material}
        </CardTitle>
      </CardHeader>

      <CardContent className="pb-3 pl-5 space-y-3">
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-2 text-primary shrink-0" />
          <span className="truncate font-medium text-foreground">{request.location}</span>
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground">
          <Package className="h-4 w-4 mr-2 text-primary shrink-0" />
          <span className="font-bold text-foreground">{request.quantity} {request.unit}</span>
        </div>

        <div className={`flex items-center text-sm ${isUrgent ? 'text-red-600 font-bold' : 'text-muted-foreground'}`}>
          <CalendarIcon className="h-4 w-4 mr-2 shrink-0" />
          <span>Срок: {format(new Date(request.deliveryDate), "dd.MM.yyyy")}</span>
          {isUrgent && <AlertCircle className="h-4 w-4 ml-auto animate-pulse" />}
        </div>
      </CardContent>

      <CardFooter className="bg-muted/30 pt-3 pb-3 pl-5 pr-4 border-t border-border/50">
        {role === "supplier" && request.status === "new" && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-secondary hover:bg-secondary/90 text-white font-display uppercase tracking-wide">
                Назначить водителя <Truck className="ml-2 h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Назначение водителя</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Выберите водителя</label>
                  <Select onValueChange={setDriverId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите из списка..." />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.map(d => (
                        <SelectItem key={d.id} value={d.id.toString()}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleAssign} 
                  disabled={!driverId || isPending}
                  className="w-full"
                >
                  Подтвердить назначение
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {role === "driver" && request.status === "in_progress" && (
          <Button 
            onClick={handleComplete} 
            disabled={isPending}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-display uppercase tracking-wide text-lg h-12"
          >
            ДОСТАВЛЕНО <CheckCircle2 className="ml-2 h-5 w-5" />
          </Button>
        )}

        {role === "foreman" && (
          <p className="text-xs text-muted-foreground italic w-full text-center">
            {request.status === "new" ? "Ожидание назначения..." : 
             request.status === "in_progress" ? "Водитель в пути" : 
             "Доставка завершена"}
          </p>
        )}
        
        {role === "supplier" && request.status !== "new" && (
           <p className="text-xs text-muted-foreground italic w-full text-center">
             {request.status === "completed" ? "Заказ выполнен" : "В процессе доставки"}
           </p>
        )}
      </CardFooter>
    </Card>
  );
}
