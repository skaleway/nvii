"use client";

import type React from "react";

import { useProjects } from "@/components/projects-provider";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@nvii/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@nvii/ui/components/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@nvii/ui/components/form";
import { Input } from "@nvii/ui/components/input";
import { Loader2, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const projectSchema = z.object({
  name: z.string().min(2, {
    message: "Project name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  envVariables: z.record(z.string(), z.string()).optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

type EnvVariable = {
  key: string;
  value: string;
};

export function AddProjectDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { addProject, isLoading } = useProjects();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
    },
  });

  async function onSubmit(data: ProjectFormValues) {
    try {
      const projectData = {
        name: data.name,
        description: "",
        status: "valid" as const,
        key: crypto.randomUUID(),
        deviceId: crypto.randomUUID(),
        envCount: 0,
        slug: data.name.toLowerCase().replace(/\s+/g, "-"),
      };

      await addProject(projectData);

      toast({
        title: "Project created",
        description: `${data.name} has been created successfully.`,
      });

      setOpen(false);
      form.reset();

      // Navigate to the new project
      router.push(`/projects/${projectData.slug}`);
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Your project could not be created. Please try again.",
        variant: "destructive",
      });
      console.error("Error creating project:", error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create a new project</DialogTitle>
          <DialogDescription>
            Add a new project to manage its environment variables.
          </DialogDescription>
        </DialogHeader>
        {/* @ts-expect-error - react-hook-form types are not compatible with react 19 */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              // @ts-expect-error - react-hook-form types are not compatible with react 19
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Awesome Project" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <p className="text-sm text-muted-foreground">
              You can add environment variables after creating the project.
            </p>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Project
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
