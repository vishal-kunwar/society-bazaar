import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { MapPin, CheckCircle2, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = [
  "Food & Tiffin", "Bakery & Sweets", "Tuition & Classes", "Fitness & Yoga",
  "Tailoring", "Beauty & Wellness", "Home Services", "Others",
];

const formSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  ownerName: z.string().min(2, "Owner name is required"),
  societyId: z.string().min(1, "Society is required"),
  category: z.string().min(2, "Category is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  whatsapp: z.string().min(10, "Valid WhatsApp number is required"),
  description: z.string().min(20, "Description must be at least 20 characters"),
});

export default function Sell() {
  const [, setLocation] = useLocation();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const { data: societies } = useQuery({
    queryKey: ["societies"],
    queryFn: () => api.societies.list(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: "", ownerName: "", societyId: "", category: "",
      phone: "", whatsapp: "", description: "",
    },
  });

  const createBusiness = useMutation({
    mutationFn: (values: z.infer<typeof formSchema>) =>
      api.businesses.create({
        businessName: values.businessName,
        ownerName: values.ownerName,
        societyId: Number(values.societyId),
        category: values.category,
        phone: values.phone,
        whatsapp: values.whatsapp,
        description: values.description,
      }),
    onSuccess: () => {
      setIsSubmitted(true);
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createBusiness.mutate(values);
  }

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/20 selection:text-primary">
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <MapPin className="text-primary-foreground w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">
              Society<span className="text-primary">Bazaar</span>
            </span>
          </div>
          <button onClick={() => setLocation("/")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Home</button>
        </div>
      </nav>

      <main className="pb-24">
        <section className="pt-16 pb-12 overflow-hidden bg-muted/30 border-b border-border/50">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
              List Your Business on Society Bazaar
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join 500+ home-based sellers. First 6 months completely free.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 md:px-6 mt-12">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => setLocation("/")}
              className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
            </button>

            {isSubmitted ? (
              <Card className="border-primary/20 shadow-lg p-12 text-center bg-primary/5">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring" }}
                  className="flex flex-col items-center"
                >
                  <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">Your listing is submitted!</h2>
                  <p className="text-muted-foreground mb-2">We'll review and publish it within 24 hours.</p>
                  <p className="text-sm text-muted-foreground mb-8">You can track the status in your seller dashboard.</p>
                  <div className="flex gap-3 flex-wrap justify-center">
                    <Button size="lg" onClick={() => setLocation("/dashboard")} data-testid="button-go-dashboard">View Dashboard</Button>
                    <Button size="lg" variant="outline" onClick={() => setLocation("/")} data-testid="button-back-home">Back to Home</Button>
                  </div>
                </motion.div>
              </Card>
            ) : (
              <Card className="border-border/50 shadow-md">
                <CardContent className="p-6 md:p-8">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="businessName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Business Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Priya's Home Tiffin" {...field} data-testid="input-business-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="ownerName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Owner Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Priya Sharma" {...field} data-testid="input-owner-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="societyId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Society Name</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-society">
                                    <SelectValue placeholder="Select a society" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {societies?.map(s => (
                                    <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-category">
                                    <SelectValue placeholder="Select a category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {CATEGORIES.map(c => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input type="tel" placeholder="10-digit mobile number" {...field} data-testid="input-phone" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="whatsapp"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>WhatsApp Number</FormLabel>
                              <FormControl>
                                <Input type="tel" placeholder="For customer inquiries" {...field} data-testid="input-whatsapp" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Tell your neighbours about what you offer..."
                                className="min-h-[120px] resize-none"
                                {...field}
                                data-testid="input-description"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full font-bold hover-elevate"
                        disabled={createBusiness.isPending}
                        data-testid="button-submit-listing"
                      >
                        {createBusiness.isPending ? "Submitting..." : "Submit Listing"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
