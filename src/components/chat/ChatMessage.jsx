import ReactMarkdown from 'react-markdown';
import PatentCard from '../public/PatentCard';

export default function ChatMessage({ message, onInterest }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 chat-message-enter ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-sm mt-0.5">
          <span className="text-white text-xs font-bold">IA</span>
        </div>
      )}

      <div className={`max-w-[85%] sm:max-w-[75%] space-y-3 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* Text bubble */}
        {message.content && (
          <div className={`px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed ${
            isUser
              ? 'bg-primary text-white rounded-tr-sm'
              : 'bg-white border border-border text-foreground rounded-tl-sm'
          }`}>
            {isUser ? (
              <p>{message.content}</p>
            ) : (
              <ReactMarkdown
                className="prose prose-sm max-w-none prose-headings:font-bold prose-p:my-1 prose-ul:my-1 prose-li:my-0.5"
                components={{
                  p: ({ children }) => <p className="my-1">{children}</p>,
                  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                  ul: ({ children }) => <ul className="my-1 ml-4 list-disc space-y-0.5">{children}</ul>,
                  li: ({ children }) => <li className="text-sm">{children}</li>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>
        )}

        {/* Patent cards */}
        {message.patents && message.patents.length > 0 && (
          <div className="w-full space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
              Patentes encontradas ({message.patents.length})
            </p>
            <div className="grid gap-3">
              {message.patents.map((patent, i) => (
                <PatentCard
                  key={patent.id || i}
                  patent={patent}
                  relevanceScore={patent._score}
                  onInterest={onInterest}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 shadow-sm mt-0.5">
          <span className="text-white text-xs font-bold">EU</span>
        </div>
      )}
    </div>
  );
}