import React from "react";
import { motion } from "framer-motion";

interface StatusMessagesProps {
  error: string | null;
  loading: boolean;
}

export const StatusMessages: React.FC<StatusMessagesProps> = ({
  error,
  loading,
}) => {
  if (loading || !error) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4"
    >
      <div className="text-sm text-amber-800">
        Warning: {error}. Unable to load workflows.
      </div>
    </motion.div>
  );
};
