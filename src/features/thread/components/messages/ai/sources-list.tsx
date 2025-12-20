import { FC, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { BookCheck, Globe, Loader2 } from "lucide-react";
import { Source } from "../../markdown/components/citation-link";
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
    <li className="text-sm text-gray-600">
      <span className="font-semibold text-gray-800">[{source.id}]</span>{" "}
      {source.filename ? (
        <span
          role="button"
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          aria-label={`Open ${source.title || source.filename} (PDF, opens in new tab)`}
          aria-disabled={isLoading}
          className="text-primary/70 hover:text-primary/90 cursor-pointer font-normal underline underline-offset-2 transition-colors aria-disabled:cursor-wait aria-disabled:opacity-70"
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
      className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4"
    >
      <h3 className="mb-4 text-sm font-semibold text-gray-900">Sources</h3>
      <div className="space-y-4">
        {library.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <BookCheck className="h-4 w-4" />
              <span>From Our Library</span>
            </div>
            <ol className="ml-6 space-y-2">
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
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <Globe className="h-4 w-4" />
              <span>Web Discoveries</span>
            </div>
            <ol className="ml-6 space-y-2">
              {web.map((source) => (
                <li
                  key={source.id}
                  className="text-sm text-gray-600"
                >
                  <span className="font-semibold text-gray-800">
                    [{source.id}]
                  </span>{" "}
                  {source.url ? (
                    <>
                      Retrieved from:{" "}
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary/70 hover:text-primary/90 font-normal underline underline-offset-2 transition-colors"
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
