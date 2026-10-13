// Dekorasi latar halaman login: gelombang di sudut dan salib kecil
function Cross({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 30 30" aria-hidden="true" className={className}>
      <path
        d="M11 3a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3v8h8a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3h-8v8a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3v-8H3a3 3 0 0 1-3-3v-2a3 3 0 0 1 3-3h8z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function LoginBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg viewBox="0 0 140 140" className="absolute left-0 top-0 h-[150px] w-[150px] text-teal-100/80">
        <path d="M0 0h138c-6 34-30 44-62 56C40 70 14 92 0 134z" fill="currentColor" />
        <path d="M0 0h96C88 22 70 30 46 38 22 46 8 60 0 86z" fill="#fff" fillOpacity=".35" />
      </svg>
      <svg viewBox="0 0 170 130" className="absolute bottom-0 right-0 h-32 w-44 text-teal-100/80">
        <path d="M170 130H0c30-8 54-22 80-52 26-30 56-58 90-76z" fill="currentColor" />
        <path d="M170 130H56c26-6 46-18 64-40 16-20 32-34 50-44z" fill="#fff" fillOpacity=".35" />
      </svg>

      <Cross className="absolute right-[26px] top-[31px] h-[46px] w-[46px] text-teal-100" />
      <Cross className="absolute right-[15px] top-[73px] h-[19px] w-[19px] text-teal-100" />
      <Cross className="absolute bottom-[63px] left-[19px] h-[33px] w-[33px] text-teal-100" />
      <Cross className="absolute bottom-[53px] left-[52px] h-[17px] w-[17px] text-teal-100" />
    </div>
  );
}
