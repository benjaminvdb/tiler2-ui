import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ExpandButtonProps {
  isExpanded: boolean;
  onToggle: () => void;
}
export const ExpandButton: React.FC<ExpandButtonProps> = ({
  isExpanded,
  onToggle,
}) => {
  return (
    <motion.button
      onClick={onToggle}
      className="flex w-full cursor-pointer items-center justify-center border-t-[1px] border-gray-200 py-2 text-gray-500 transition-all duration-200 ease-in-out hover:bg-gray-50 hover:text-gray-600"
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {isExpanded ? <ChevronUp /> : <ChevronDown />}
    </motion.button>
  );
};
