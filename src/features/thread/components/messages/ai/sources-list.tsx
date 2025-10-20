import { FC } from "react";
import { BookCheck, Globe } from "lucide-react";
import { Source } from "../../markdown/components/citation-link";
import { formatMLA, groupSourcesByType } from "../../markdown/utils/citation-utils";

interface SourcesListProps {
  sources: Source[];
}

export const SourcesList: FC<SourcesListProps> = ({ sources }) => {
  if (!sources || sources.length === 0) {
    return null;
  }

  // Sources are already filtered and renumbered by renumberCitations()
  const { library, web } = groupSourcesByType(sources);

  return (
    <div
      id="sources-section"
      className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4"
    >
      <h3 className="mb-4 text-sm font-semibold text-gray-900">Sources</h3>

      <div className="space-y-4">
        {/* Library sources (knowledge_base, methods_base, csrd_reports) */}
        {library.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <BookCheck className="h-4 w-4" />
              <span>From Our Library</span>
            </div>
            <ol className="ml-6 space-y-2">
              {library.map((source) => (
                <li
                  key={source.id}
                  className="text-sm text-gray-600"
                >
                  <span className="font-semibold text-gray-800">
                    [{source.id}]
                  </span>{" "}
                  {formatMLA(source)}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Web sources */}
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
                        className="text-primary/70 hover:text-primary/90 underline underline-offset-2 transition-colors font-normal"
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
