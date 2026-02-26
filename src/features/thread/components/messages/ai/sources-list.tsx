import { FC, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { BookCheck, Globe, Loader2 } from "lucide-react";
import type { Source } from "./source-types";
import {
  formatMLA,
  groupSourcesByType,
} from "../../markdown/utils/citation-utils";
import { fetchDocumentPresignedUrl } from "../../../services/document-service";

interface LibrarySourceItemProps {
  source: Source;
  isLoading: boolean;
  onDocumentClick: (source: Source) => void;
}

const LibrarySourceItem: FC<LibrarySourceItemProps> = ({
  source,
  isLoading,
  onDocumentClick,
}) => {
  const handleClick = () => {
    if (!isLoading) onDocumentClick(source);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === " ") && !isLoading) {
      e.preventDefault();
      onDocumentClick(source);
    }
  };

  return (
    <li className="text-sm leading-relaxed text-gray-600">
      <span className="font-medium text-gray-500">[{source.id}]</span>{" "}
      {source.filename ? (
        <span
          role="button"
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          aria-label={`Open ${source.title || source.filename} (PDF, opens in new tab)`}
          aria-disabled={isLoading}
          className="text-primary/70 hover:text-primary/90 focus-visible:ring-primary/40 cursor-pointer rounded-sm font-normal underline underline-offset-2 transition-colors focus-visible:ring-2 focus-visible:outline-none aria-disabled:cursor-wait aria-disabled:opacity-70"
        >
          {isLoading && (
            <Loader2 className="mr-1 inline h-3 w-3 animate-spin" />
          )}
          {formatMLA(source)}
        </span>
      ) : (
        formatMLA(source)
      )}
    </li>
  );
};

interface SourcesListProps {
  sources: Source[];
}

export const SourcesList: FC<SourcesListProps> = ({ sources }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleDocumentClick = async (source: Source): Promise<void> => {
    if (!source.filename) return;
    try {
      setLoadingId(source.id);
      const token = await getAccessTokenSilently();
      const presignedUrl = await fetchDocumentPresignedUrl(
        source.filename,
        token,
      );
      window.open(presignedUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Failed to open document:", error);
    } finally {
      setLoadingId(null);
    }
  };

  if (!sources || sources.length === 0) {
    return null;
  }

  const { library, web } = groupSourcesByType(sources);

  return (
    <div
      id="sources-section"
      aria-labelledby="sources-title"
      className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4"
    >
      <h3
        id="sources-title"
        className="mb-3 font-sans text-sm font-medium text-gray-600"
      >
        Sources
      </h3>
      <div className="space-y-3">
        {library.length > 0 && (
          <div>
            <h4 className="mb-1.5 flex items-center gap-2 font-sans text-xs font-medium text-gray-700">
              <BookCheck className="h-4 w-4" />
              <span>From Our Library</span>
            </h4>
            <ol
              aria-label="Library sources"
              className="ml-5 space-y-1.5"
            >
              {library.map((source) => (
                <LibrarySourceItem
                  key={source.id}
                  source={source}
                  isLoading={loadingId === source.id}
                  onDocumentClick={handleDocumentClick}
                />
              ))}
            </ol>
          </div>
        )}
        {web.length > 0 && (
          <div>
            <h4 className="mb-1.5 flex items-center gap-2 font-sans text-xs font-medium text-gray-700">
              <Globe className="h-4 w-4" />
              <span>Web Discoveries</span>
            </h4>
            <ol
              aria-label="Web sources"
              className="ml-5 space-y-1.5"
            >
              {web.map((source) => (
                <li
                  key={source.id}
                  className="text-sm leading-relaxed text-gray-600"
                >
                  <span className="font-medium text-gray-500">
                    [{source.id}]
                  </span>{" "}
                  {source.url ? (
                    <>
                      Retrieved from:{" "}
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary/70 hover:text-primary/90 focus-visible:ring-primary/40 rounded-sm font-normal underline underline-offset-2 transition-colors focus-visible:ring-2 focus-visible:outline-none"
                      >
                        {source.url}
                      </a>
                    </>
                  ) : (
                    formatMLA(source)
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};
