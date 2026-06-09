export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 chat-message-enter">
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-sm">
        <span className="text-white text-xs font-bold">IA</span>
      </div>
      <div className="bg-white border border-border rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          <div className="typing-dot w-2 h-2 rounded-full bg-primary/60" />
          <div className="typing-dot w-2 h-2 rounded-full bg-primary/60" />
          <div className="typing-dot w-2 h-2 rounded-full bg-primary/60" />
        </div>
      </div>
    </div>
  );
}