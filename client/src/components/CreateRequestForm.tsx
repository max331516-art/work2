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

const LOCATIONS = ["Объект Альфа (Центр)", "Объект Бета (Промзона)", "Объект Гамма (Жилой массив)"];
const MATERIALS = ["Бетон M300", "Арматура 12мм", "Кирпич (Красный)", "Цемент (50кг)", "Песок", "Щебень"];
const UNITS = ["м3", "тонн", "шт", "мешков", "кг"];

// Schema adaptation for form (string dates need conversion)
const formSchema = insertRequestSchema.extend({
  deliveryDate: z.date({ required_error: "Дата доставки обязательна" }),
  quantity: z.number().min(1, "Количество должно быть не менее 1"),
});

export function CreateRequestForm() {
  const { mutate, isPending } = useCreateRequest();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "",
      material: "",
      quantity: 1,
      unit: "шт",
      comment: "",
      createdById: 1,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const formattedData = {
      ...values,
      deliveryDate: format(values.deliveryDate, 'yyyy-MM-dd'),
    };
    
    mutate(formattedData as any, {
      onSuccess: () => {
        form.reset({
          location: "",
          material: "",
          quantity: 1,
          unit: "шт",
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

  const selectedDate = form.watch("deliveryDate");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Объект</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-14 text-lg bg-white border-2 border-border focus:border-primary transition-colors">
                    <SelectValue placeholder="Выберите объект" />
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

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <FormField
              control={form.control}
              name="material"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Материал</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-14 text-lg bg-white border-2 border-border focus:border-primary transition-colors">
                        <SelectValue placeholder="Выберите материал" />
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
                  <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Ед. изм.</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-14 text-lg bg-white border-2 border-border focus:border-primary transition-colors">
                        <SelectValue placeholder="Ед." />
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

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Количество</FormLabel>
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

        <FormField
          control={form.control}
          name="deliveryDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Дата поставки</FormLabel>
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
                        format(field.value, "dd.MM.yyyy")
                      ) : (
                        <span>Выберите дату</span>
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
          className="w-full h-16 text-xl font-body uppercase tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg mt-8"
        >
          {isPending ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : "Создать заявку"}
        </Button>
      </form>
    </Form>
  );
}
