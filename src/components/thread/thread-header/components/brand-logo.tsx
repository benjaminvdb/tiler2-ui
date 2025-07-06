import { motion } from "framer-motion";
import { LinkLogoSVG } from "@/components/icons/link";
import { useUIContext } from "@/providers/ui";

export function BrandLogo() {
  const { chatHistoryOpen, onNewThread } = useUIContext();
  return (
    <motion.button
      className="flex cursor-pointer items-center gap-2"
      onClick={onNewThread}
      animate={{
        marginLeft: !chatHistoryOpen ? 48 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
    >
      <LinkLogoSVG
        width={32}
        height={32}
      />
      <span className="text-xl font-semibold tracking-tight">Link Chat</span>
    </motion.button>
  );
}
