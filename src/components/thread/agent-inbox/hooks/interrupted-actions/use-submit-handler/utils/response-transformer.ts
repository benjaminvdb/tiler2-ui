import { HumanResponse } from "@langchain/langgraph/prebuilt";
import { HumanResponseWithEdits } from "../../../../types";

export function transformHumanResponse(
  humanResponse: HumanResponseWithEdits[],
): HumanResponse[] {
  return humanResponse.flatMap((r) => {
    if (r.type === "edit") {
      if (r.acceptAllowed && !r.editsMade) {
        return {
          type: "accept",
          args: r.args,
        };
      } else {
        return {
          type: "edit",
          args: r.args,
        };
      }
    }

    if (r.type === "response" && !r.args) {
      // If response was allowed but no response was given, do not include in the response
      return [];
    }

    return {
      type: r.type,
      args: r.args,
    };
  });
}
