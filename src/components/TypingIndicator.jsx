export default function TypingIndicator() {
  return (
    <div className="flex justify-start mb-3 anim-bubble-in">
      {/* Bot avatar */}
      <div className="flex-shrink-0 mr-2 mt-1 flex items-center justify-center rounded-full shadow-sm"
        style={{
          width: 32, height: 32, fontSize: 16,
          background: 'linear-gradient(135deg,#7C3AED,#6D28D9)'
        }}>
        🛡️
      </div>

      <div className="flex flex-col gap-1">
        {/* Dots bubble */}
        <div className="px-4 py-3"
          style={{
            borderRadius: '18px 18px 18px 4px',
            background: '#fff',
            borderLeft: '3px solid #C4B5FD',
            border: '1px solid #F0EDE8',
            borderLeftWidth: 3,
            borderLeftColor: '#C4B5FD',
            boxShadow: '0 1px 6px rgba(0,0,0,.07)',
          }}>
          <div className="flex gap-1.5 items-center">
            <span className="dot-bounce" />
            <span className="dot-bounce" />
            <span className="dot-bounce" />
          </div>
        </div>
        <p className="ml-1 text-xs font-semibold" style={{ color: '#A8A29E' }}>
          VittSakhi type kare che... ✍️
        </p>
      </div>
    </div>
  )
}