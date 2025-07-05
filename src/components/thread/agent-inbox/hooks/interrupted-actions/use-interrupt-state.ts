import { useState, useRef, useEffect, MutableRefObject } from "react";
import { HumanInterrupt } from "@langchain/langgraph/prebuilt";
import { HumanResponseWithEdits, SubmitType } from "../../types";
import { createDefaultHumanResponse } from "../../utils";

interface UseInterruptStateReturn {
  humanResponse: HumanResponseWithEdits[];
  setHumanResponse: React.Dispatch<
    React.SetStateAction<HumanResponseWithEdits[]>
  >;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  streaming: boolean;
  setStreaming: React.Dispatch<React.SetStateAction<boolean>>;
  streamFinished: boolean;
  setStreamFinished: React.Dispatch<React.SetStateAction<boolean>>;
  selectedSubmitType: SubmitType | undefined;
  setSelectedSubmitType: React.Dispatch<
    React.SetStateAction<SubmitType | undefined>
  >;
  hasEdited: boolean;
  setHasEdited: React.Dispatch<React.SetStateAction<boolean>>;
  hasAddedResponse: boolean;
  setHasAddedResponse: React.Dispatch<React.SetStateAction<boolean>>;
  acceptAllowed: boolean;
  setAcceptAllowed: React.Dispatch<React.SetStateAction<boolean>>;
  initialHumanInterruptEditValue: MutableRefObject<Record<string, string>>;
  supportsMultipleMethods: boolean;
}

export function useInterruptState(
  interrupt: HumanInterrupt,
): UseInterruptStateReturn {
  const [humanResponse, setHumanResponse] = useState<HumanResponseWithEdits[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [streamFinished, setStreamFinished] = useState(false);
  const [selectedSubmitType, setSelectedSubmitType] = useState<SubmitType>();
  const [hasEdited, setHasEdited] = useState(false);
  const [hasAddedResponse, setHasAddedResponse] = useState(false);
  const [acceptAllowed, setAcceptAllowed] = useState(false);
  const initialHumanInterruptEditValue = useRef<Record<string, string>>({});

  useEffect(() => {
    try {
      const { responses, defaultSubmitType, hasAccept } =
        createDefaultHumanResponse(interrupt, initialHumanInterruptEditValue);
      setSelectedSubmitType(defaultSubmitType);
      setHumanResponse(responses);
      setAcceptAllowed(hasAccept);
    } catch (e) {
      console.error("Error formatting and setting human response state", e);
    }
  }, [interrupt]);

  const supportsMultipleMethods =
    humanResponse.filter(
      (r) => r.type === "edit" || r.type === "accept" || r.type === "response",
    ).length > 1;

  return {
    humanResponse,
    setHumanResponse,
    loading,
    setLoading,
    streaming,
    setStreaming,
    streamFinished,
    setStreamFinished,
    selectedSubmitType,
    setSelectedSubmitType,
    hasEdited,
    setHasEdited,
    hasAddedResponse,
    setHasAddedResponse,
    acceptAllowed,
    setAcceptAllowed,
    initialHumanInterruptEditValue,
    supportsMultipleMethods,
  };
}
