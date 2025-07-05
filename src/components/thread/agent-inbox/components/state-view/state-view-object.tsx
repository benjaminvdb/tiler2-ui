import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { prettifyText } from "../../utils";
import { HasContentsEllipsis } from "./has-contents-ellipsis";
import { StateViewRecursive } from "./state-view-recursive";

interface StateViewObjectProps {
  keyName: string;
  value: unknown;
  expanded?: boolean;
}

export function StateViewObject({
  keyName,
  value,
  expanded: propExpanded,
}: StateViewObjectProps) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (propExpanded != null) {
      setExpanded(propExpanded);
    }
  }, [propExpanded]);

  return (
    <div className="relative flex flex-row items-start justify-start gap-2 text-sm">
      <motion.div
        initial={false}
        animate={{ rotate: expanded ? 90 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <div
          onClick={() => setExpanded((prev) => !prev)}
          className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-md text-gray-500 transition-colors ease-in-out hover:bg-gray-100 hover:text-black"
        >
          <ChevronRight className="h-4 w-4" />
        </div>
      </motion.div>
      <div className="flex w-full flex-col items-start justify-start gap-1">
        <p className="font-normal text-black">
          {prettifyText(keyName)}{" "}
          {!expanded && (
            <HasContentsEllipsis onClick={() => setExpanded((prev) => !prev)} />
          )}
        </p>
        <motion.div
          initial={false}
          animate={{
            height: expanded ? "auto" : 0,
            opacity: expanded ? 1 : 0,
          }}
          transition={{
            duration: 0.2,
            ease: "easeInOut",
          }}
          style={{ overflow: "hidden" }}
          className="relative w-full"
        >
          <StateViewRecursive
            expanded={propExpanded}
            value={value}
          />
        </motion.div>
      </div>
    </div>
  );
}
