import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useClerk, UserButton } from "@clerk/react";
import { motion } from "framer-motion";
import {
  MapPin, ArrowLeft, Plus, Pencil, Trash2, GripVertical, Package,
  LogOut, Star, Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { api, type Product } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const EMPTY_FORM = {
  name: "",
  description: "",
  image: "",
  price: "",
  category: "",
  featured: false,
  active: true,
};

export default function SellerProducts() {
  const { businessId: businessIdParam } = useParams<{ businessId: string }>();
  const businessId = Number(businessIdParam);
  const [, setLocation] = useLocation();
  const { signOut } = useClerk();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [items, setItems] = useState<Product[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const { data: businesses } = useQuery({
    queryKey: ["my-businesses"],
    queryFn: () => api.businesses.mine(),
  });

  const businessRow = businesses?.find(r => r.business.id === businessId);
  const businessName = businessRow?.business.businessName ?? "Business";

  const { data: products, isLoading } = useQuery({
    queryKey: ["products-manage", businessId],
    queryFn: () => api.products.manage(businessId),
    enabled: Number.isFinite(businessId) && businessId > 0,
  });

  useEffect(() => {
    if (products) setItems(products);
  }, [products]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["products-manage", businessId] });
    qc.invalidateQueries({ queryKey: ["products", businessId] });
  };

  const saveProduct = useMutation({
    mutationFn: () =>
      editing
        ? api.products.update(editing.id, form)
        : api.products.create(businessId, form),
    onSuccess: () => {
      invalidate();
      setDialogOpen(false);
      setEditing(null);
      setForm(EMPTY_FORM);
      toast({ title: editing ? "Product updated" : "Product created" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteProduct = useMutation({
    mutationFn: (id: number) => api.products.delete(id),
    onSuccess: () => {
      invalidate();
      setDeleteTarget(null);
      toast({ title: "Product deleted" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const reorderProducts = useMutation({
    mutationFn: (productIds: number[]) => api.products.reorder(businessId, productIds),
    onSuccess: (updated) => {
      setItems(updated);
      qc.setQueryData(["products-manage", businessId], updated);
      qc.invalidateQueries({ queryKey: ["products", businessId] });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description,
      image: product.image,
      price: product.price,
      category: product.category,
      featured: product.featured,
      active: product.active,
    });
    setDialogOpen(true);
  }

  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    setItems(prev => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    setDragIndex(index);
  }

  function handleDragEnd() {
    if (dragIndex !== null && items.length > 0) {
      reorderProducts.mutate(items.map(p => p.id));
    }
    setDragIndex(null);
  }

  if (!Number.isFinite(businessId) || businessId <= 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Button onClick={() => setLocation("/dashboard")} variant="outline">Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <MapPin className="text-primary-foreground w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">Hust<span className="text-primary">ly</span></span>
          </div>
          <div className="flex items-center gap-2 border-l border-border/40 pl-2 ml-1">
            <Button variant="outline" size="sm" onClick={() => signOut({ redirectUrl: basePath || "/" })}>
              <LogOut className="w-4 h-4 mr-1" />Sign Out
            </Button>
            <div className="h-8 w-8 flex items-center justify-center">
              <UserButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 md:px-6 py-10 max-w-3xl">
        <button
          onClick={() => setLocation("/dashboard")}
          className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </button>

        <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">Products & Services</h1>
            </div>
            <p className="text-muted-foreground text-sm">{businessName}</p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-1" /> Add Product
          </Button>
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}
          </div>
        )}

        {!isLoading && items.length === 0 && (
          <Card className="border-dashed border-2 border-border/60">
            <CardContent className="p-10 text-center">
              <Package className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-bold mb-2">No products yet</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Add your menu items, services, or offerings so buyers can browse and enquire on WhatsApp.
              </p>
              <Button onClick={openCreate}><Plus className="w-4 h-4 mr-1" /> Add First Product</Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && items.length > 0 && (
          <>
            <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
              <GripVertical className="w-3.5 h-3.5" /> Drag to reorder · Featured items appear first to buyers
            </p>
            <div className="space-y-3">
              {items.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <Card
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`border-border/50 cursor-grab active:cursor-grabbing ${!product.active ? "opacity-60" : ""}`}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <GripVertical className="w-5 h-5 text-muted-foreground shrink-0" />
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0 border border-border/40">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <h3 className="font-semibold truncate">{product.name}</h3>
                          {product.featured && (
                            <Badge className="text-[10px] bg-yellow-100 text-yellow-800 border-yellow-200">
                              <Star className="w-3 h-3 mr-0.5 fill-yellow-600" />Featured
                            </Badge>
                          )}
                          {!product.active && (
                            <Badge variant="secondary" className="text-[10px]">Hidden</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">{product.description || "No description"}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs">
                          {product.price && <span className="font-semibold text-primary">{product.price}</span>}
                          {product.category && <Badge variant="outline" className="text-[10px]">{product.category}</Badge>}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(product)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => setDeleteTarget(product)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Name *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Veg Thali" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="What's included, sizes, etc." className="resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Price</Label>
                <Input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="₹150" />
              </div>
              <div>
                <Label>Category</Label>
                <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Lunch" />
              </div>
            </div>
            <div>
              <Label>Image URL</Label>
              <Input type="url" value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="https://i.imgur.com/photo.jpg" />
              <p className="text-[11px] text-muted-foreground mt-1">
                Upload to Imgur or ImgBB, then paste the link — same as business listing images.
              </p>
              {form.image && (
                <div className="mt-2 h-24 rounded-lg overflow-hidden border border-border">
                  <img src={form.image} alt="Preview" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = "none")} />
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch checked={form.featured} onCheckedChange={v => setForm(f => ({ ...f, featured: v }))} id="featured" />
                <Label htmlFor="featured">Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.active} onCheckedChange={v => setForm(f => ({ ...f, active: v }))} id="active" />
                <Label htmlFor="active">Active</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button disabled={!form.name.trim() || saveProduct.isPending} onClick={() => saveProduct.mutate()}>
              {saveProduct.isPending ? "Saving…" : editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.name}" will be permanently removed from your catalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteTarget && deleteProduct.mutate(deleteTarget.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
