import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRequestSchema, type CreateRequestInput } from "@shared/schema";
import { useCreateRequest } from "@/hooks/use-requests";
import { useUsers } from "@/hooks/use-users";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { z } from "zod";

const LOCATIONS = ["Site Alpha (Downtown)", "Site Beta (Industrial)", "Site Gamma (Residential)"];
const MATERIALS = ["Concrete M300", "Steel Rebar 12mm", "Bricks (Red)", "Cement Bags (50kg)", "Sand (River)", "Gravel"];
const UNITS = ["m3", "tons", "pcs", "bags", "kg"];

// Schema adaptation for form (string dates need conversion)
const formSchema = insertRequestSchema.extend({
  deliveryDate: z.date({ required_error: "Delivery date is required" }),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

export function CreateRequestForm() {
  const { mutate, isPending } = useCreateRequest();
  
  // In a real app, we'd get the current logged in user. 
  // For this demo, we'll pick the first user with role 'foreman' or hardcode an ID.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "",
      material: "",
      quantity: 1,
      unit: "pcs",
      comment: "",
      createdById: 1, // Hardcoded for MVP as per instructions (or assumes seed data)
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Format date to string YYYY-MM-DD for API if needed, but schema handles Date object usually if coerced.
    // Drizzle/Postgres expects YYYY-MM-DD string often, but drizzle-zod handles conversions.
    // However, our schema defines deliveryDate as date(), which usually maps to string in JSON.
    // Let's ensure we pass a string or Date object correctly.
    // Based on the schema definition in shared/schema, it expects a string "YYYY-MM-DD" or Date object depending on driver.
    // We will pass the Date object directly as most modern libs handle it, or stringify if it fails.
    
    // Actually, `drizzle-orm/pg-core` `date` type expects a string "YYYY-MM-DD".
    const formattedData = {
      ...values,
      deliveryDate: format(values.deliveryDate, 'yyyy-MM-dd'),
    };
    
    mutate(formattedData as any, { // casting because of date string/object mismatch potential
      onSuccess: () => {
        form.reset({
          location: "",
          material: "",
          quantity: 1,
          unit: "pcs",
          comment: "",
          createdById: 1,
        });
      },
    });
  }

  const adjustQuantity = (amount: number) => {
    const current = form.getValues("quantity");
    if (current + amount >= 1) {
      form.setValue("quantity", current + amount);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Location Selection */}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Location</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-14 text-lg bg-white border-2 border-border focus:border-primary transition-colors">
                    <SelectValue placeholder="Select Site" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {LOCATIONS.map((loc) => (
                    <SelectItem key={loc} value={loc} className="text-base py-3">{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Material Selection */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <FormField
              control={form.control}
              name="material"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Material</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-14 text-lg bg-white border-2 border-border focus:border-primary transition-colors">
                        <SelectValue placeholder="Select Material" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MATERIALS.map((mat) => (
                        <SelectItem key={mat} value={mat} className="text-base py-3">{mat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-1">
             <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Unit</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-14 text-lg bg-white border-2 border-border focus:border-primary transition-colors">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {UNITS.map((u) => (
                        <SelectItem key={u} value={u} className="text-base py-3">{u}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Quantity Stepper */}
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Quantity</FormLabel>
              <div className="flex items-center gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="h-14 w-14 rounded-lg border-2"
                  onClick={() => adjustQuantity(-1)}
                >
                  <Minus className="h-6 w-6" />
                </Button>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number" 
                    className="h-14 text-center text-xl font-bold border-2" 
                    onChange={e => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="h-14 w-14 rounded-lg border-2"
                  onClick={() => adjustQuantity(1)}
                >
                  <Plus className="h-6 w-6" />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date Picker */}
        <FormField
          control={form.control}
          name="deliveryDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Required Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "h-14 w-full pl-3 text-left font-normal border-2 text-lg",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-5 w-5 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={isPending}
          className="w-full h-16 text-xl font-display uppercase tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg mt-8"
        >
          {isPending ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : "Create Request"}
        </Button>
      </form>
    </Form>
  );
}
