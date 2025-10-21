"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";

interface ExpertHelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  threadId: string | null;
  runId: string | null;
  aiMessageContent: string;
}

export const ExpertHelpDialog: React.FC<ExpertHelpDialogProps> = ({
  open,
  onOpenChange,
  threadId,
  runId,
  aiMessageContent,
}) => {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    // Validate message
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      toast.error("Please enter a message describing how we can help");
      return;
    }

    if (!threadId) {
      toast.error("Thread ID is missing. Please try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Get Auth0 token from session
      const tokenResponse = await fetch("/api/auth/token");
      if (!tokenResponse.ok) {
        throw new Error("Failed to get authentication token");
      }
      const { token } = await tokenResponse.json();

      // Submit to backend API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/support/expert-help`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            thread_id: threadId,
            run_id: runId,
            message: trimmedMessage,
            ai_message_content: aiMessageContent,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `Request failed with status ${response.status}`,
        );
      }

      // Success!
      toast.success("Your request has been sent to our expert team", {
        description: "We'll get back to you as soon as possible.",
      });

      // Close dialog and reset form
      setMessage("");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to submit expert help request:", error);
      toast.error("Failed to send your request", {
        description:
          error instanceof Error
            ? error.message
            : "Please try again or contact support directly.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = (): void => {
    setMessage("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Ask an Expert</DialogTitle>
            <DialogDescription className="space-y-3">
              <p>
                Before escalating to our expert team, please ensure you have:
              </p>
              <ul className="list-disc list-outside ml-5 space-y-1">
                <li>Tried asking your question in different ways</li>
                <li>Provided specific context about your situation</li>
                <li>Refined your question based on the AI&apos;s responses</li>
              </ul>
              <p>
                If you&apos;ve completed these steps and still need additional
                support, please describe your specific question below.
              </p>
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 pt-6">
            <div className="grid gap-2">
              <Label htmlFor="message">Your Message</Label>
              <Textarea
                id="message"
                placeholder="What's missing from the AI's response? What specifically should the expert address?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isSubmitting}
                className="min-h-[120px]"
                maxLength={2000}
                required
              />
              <p className="text-muted-foreground text-xs">
                {message.length}/2000 characters
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 space-y-2 mb-6">
            <p className="text-sm font-medium">What happens next:</p>
            <ul className="list-disc list-outside ml-5 space-y-1 text-sm text-muted-foreground">
              <li>
                Your chat history and context will be shared with Link
                Nature&apos;s expert team
              </li>
              <li>
                You&apos;ll receive a detailed response via email within 48
                hours
              </li>
            </ul>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send to Expert"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
