"use client";

import * as React from "react";
import {
  AlertDialog as AlertDialogRoot,
  AlertDialogContent as AlertDialogContentPrimitive,
  AlertDialogOverlay as AlertDialogOverlayPrimitive,
  AlertDialogPortal as AlertDialogPortalPrimitive,
  AlertDialogTrigger as AlertDialogTriggerPrimitive,
  AlertDialogHeader as AlertDialogHeaderPrimitive,
  AlertDialogFooter as AlertDialogFooterPrimitive,
  AlertDialogTitle as AlertDialogTitlePrimitive,
  AlertDialogDescription as AlertDialogDescriptionPrimitive,
  AlertDialogAction as AlertDialogActionPrimitive,
  AlertDialogCancel as AlertDialogCancelPrimitive,
} from "@/components/animate-ui/primitives/radix/alert-dialog";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

function AlertDialog(props: React.ComponentProps<typeof AlertDialogRoot>) {
  return <AlertDialogRoot {...props} />;
}

function AlertDialogTrigger(
  props: React.ComponentProps<typeof AlertDialogTriggerPrimitive>,
) {
  return <AlertDialogTriggerPrimitive {...props} />;
}

function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogOverlayPrimitive>) {
  return (
    <AlertDialogOverlayPrimitive
      className={cn("fixed inset-0 z-50 bg-black/50", className)}
      {...props}
    />
  );
}

function AlertDialogContent({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogContentPrimitive>) {
  return (
    <AlertDialogPortalPrimitive>
      <AlertDialogOverlay />
      <AlertDialogContentPrimitive
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-200/60 bg-background p-6 shadow-lg sm:max-w-lg sm:rounded-lg",
          className,
        )}
        {...props}
      />
    </AlertDialogPortalPrimitive>
  );
}

function AlertDialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <AlertDialogHeaderPrimitive
      className={cn(
        "flex flex-col space-y-2 text-center sm:text-left",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <AlertDialogFooterPrimitive
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogTitlePrimitive>) {
  return (
    <AlertDialogTitlePrimitive
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  );
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogDescriptionPrimitive>) {
  return (
    <AlertDialogDescriptionPrimitive
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogActionPrimitive>) {
  return (
    <AlertDialogActionPrimitive
      className={cn(buttonVariants(), "rounded-full cursor-pointer", className)}
      {...props}
    />
  );
}

function AlertDialogCancel({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogCancelPrimitive>) {
  return (
    <AlertDialogCancelPrimitive
      className={cn(
        buttonVariants({ variant: "outline" }),
        "mt-2 sm:mt-0 rounded-full cursor-pointer",
        className,
      )}
      {...props}
    />
  );
}

export {
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
