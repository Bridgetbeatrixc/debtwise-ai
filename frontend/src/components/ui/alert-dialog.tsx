"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const AlertDialog = Dialog;

const AlertDialogTrigger = DialogTrigger;

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogContent>,
  React.ComponentPropsWithoutRef<typeof DialogContent>
>(({ className, ...props }, ref) => (
  <DialogContent
    ref={ref}
    className={cn("sm:max-w-md", className)}
    showCloseButton={false}
    {...props}
  />
));
AlertDialogContent.displayName = "AlertDialogContent";

const AlertDialogHeader = ({ className, ...props }: React.ComponentProps<"div">) => (
  <DialogHeader className={cn("px-0", className)} {...props} />
);

const AlertDialogFooter = ({ className, ...props }: React.ComponentProps<"div">) => (
  <DialogFooter className={cn("flex flex-row justify-end gap-2 px-0", className)} {...props} />
);

const AlertDialogTitle = DialogTitle;
const AlertDialogDescription = DialogDescription;
const AlertDialogAction = Button;
const AlertDialogCancel = Button;

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
