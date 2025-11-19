import React from "react";
import { motion } from "framer-motion";

interface StatusMessagesProps {
  error: string | null;
  loading: boolean;
  showBuiltInOnly: boolean;
}

export const StatusMessages: React.FC<StatusMessagesProps> = ({
  error,
  loading,
  showBuiltInOnly,
}) => {
  if (loading) {
    return null;
  }

  return (
    <>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4"
        >
          <div className="text-sm text-amber-800">
            Warning: {error}. Showing built-in workflows only.
          </div>
        </motion.div>
      )}

      {!error && showBuiltInOnly && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4"
        >
          <div className="text-sm text-blue-800">
            <strong>Note:</strong> Only showing built-in workflows. The backend
            may not have returned additional workflows. Check the browser
            console for details.
          </div>
        </motion.div>
      )}
    </>
  );
};
