import { shopContact } from '../../data/shopContact'

export function LandingSocial() {
  if (!shopContact.telegramUrl) return null

  return (
    <div className="absolute bottom-[clamp(5rem,14vh,7rem)] right-[clamp(1rem,3vw,2.5rem)] z-20">
      <a
        href={shopContact.telegramUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-200/20 bg-black/40 text-[10px] font-bold text-amber-200/80 backdrop-blur-md transition-all hover:border-amber-200/40 hover:text-amber-50"
        aria-label="Telegram"
        title={shopContact.telegramUsername}
      >
        TG
      </a>
    </div>
  )
}
