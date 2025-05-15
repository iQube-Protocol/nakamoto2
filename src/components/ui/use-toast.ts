
// Re-export the useToast hook and toast function from sonner
import { toast } from 'sonner';
import { useToast as useShadcnToast } from "@/hooks/use-toast";

// Re-export the useToast hook from shadcn and toast from sonner
export { useShadcnToast as useToast, toast };
