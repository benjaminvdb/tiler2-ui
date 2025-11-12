import React, { useState } from "react";
import { toast } from "sonner";
import { UserCircle } from "lucide-react";
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
import { fetchWithRetry, AbortError } from "@/shared/utils/retry";
import { reportApiError } from "@/core/services/observability";
import { getClientConfig } from "@/core/config/client";
import { useAccessToken } from "@/features/auth/hooks/use-access-token";

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
  const apiUrl = getClientConfig().apiUrl;
  const { getToken } = useAccessToken({
    component: "ExpertHelpDialog",
    operation: "submitExpertHelp",
  });

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
      // Get Auth0 token using SDK
      const token = await getToken();
      if (!token) {
        throw new Error("Failed to get authentication token");
      }

      // Submit to backend API with retry logic
      if (!apiUrl) {
        throw new Error("API URL not configured");
      }

      const response = await fetchWithRetry(
        `${apiUrl}/api/v1/support/expert-help`,
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
          timeoutMs: 10000, // 10 second timeout
        },
        {
          maxRetries: 3,
          baseDelay: 1000,
          maxDelay: 8000,
          onRetry: (attempt, error) => {
            reportApiError(error, {
              operation: "submitExpertHelp",
              component: "ExpertHelpDialog",
              skipNotification: true, // Silent retry
              additionalData: {
                attempt,
              },
            });
          },
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
      // Log error to Sentry
      if (error instanceof AbortError) {
        reportApiError(error as Error, {
          operation: "submitExpertHelp",
          component: "ExpertHelpDialog",
        });
        toast.error("Request failed after multiple attempts", {
          description: "Please try again or contact support directly.",
        });
      } else {
        reportApiError(error as Error, {
          operation: "submitExpertHelp",
          component: "ExpertHelpDialog",
        });
        toast.error("Failed to send your request", {
          description:
            error instanceof Error
              ? error.message
              : "Please try again or contact support directly.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = (): void => {
    setMessage("");
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCircle className="text-forest-green h-5 w-5" />
              Ask an Expert
            </DialogTitle>
            <DialogDescription className="space-y-3">
              <p>
                Before escalating to our expert team, please ensure you have:
              </p>
              <ul className="ml-5 list-outside space-y-1">
                <li className="flex items-start gap-2">
                  <span className="text-sage mt-0.5">•</span>
                  <span>Tried asking your question in different ways</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sage mt-0.5">•</span>
                  <span>Provided specific context about your situation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sage mt-0.5">•</span>
                  <span>
                    Refined your question based on the AI&apos;s responses
                  </span>
                </li>
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

          <div className="bg-sand border-border mb-6 space-y-2 rounded-lg border p-4">
            <p className="text-sm font-medium">What happens next:</p>
            <ul className="text-muted-foreground ml-5 list-outside space-y-1 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-sage mt-0.5">•</span>
                <span>
                  Your chat history and context will be shared with Link
                  Nature&apos;s expert team
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sage mt-0.5">•</span>
                <span>
                  You&apos;ll receive a detailed response via email within 48
                  hours
                </span>
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
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send to Expert"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
