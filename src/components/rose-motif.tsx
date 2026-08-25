export function RoseMotif({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 420 820"
      fill="none"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {/* stem */}
      <path
        d="M214 780C204 660 246 560 224 460C206 380 176 340 190 260"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* thorns */}
      <path d="M206 690L178 672M206 690L182 706" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M228 560L258 548M228 560L256 578" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M198 420L170 406M198 420L172 438" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />

      {/* leaves */}
      <path
        d="M222 620C258 612 286 630 300 662C264 668 232 656 222 620Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M232 626C252 636 268 650 278 656" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M206 500C170 494 142 512 128 544C164 550 196 536 206 500Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M196 506C176 516 160 530 150 536" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />

      {/* bloom - outer cupped petals */}
      <path
        d="M212 250C154 258 104 226 96 172C98 152 116 140 138 144C170 150 194 178 202 214"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M214 250C272 258 322 226 330 172C328 152 310 140 288 144C256 150 232 178 224 214"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M124 168C150 170 176 188 192 212"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M302 168C276 170 250 188 234 212"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* bloom - mid cupped petals */}
      <path
        d="M210 218C168 220 132 196 122 156C126 138 144 128 164 134C190 142 206 166 212 196"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M216 218C258 220 294 196 304 156C300 138 282 128 262 134C236 142 220 166 214 196"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* bloom - inner cupped petals */}
      <path
        d="M208 186C178 186 152 168 144 140C148 126 162 118 178 124C196 132 206 150 210 172"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M218 186C248 186 274 168 282 140C278 126 264 118 248 124C230 132 220 150 216 172"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* bloom - spiral furled center */}
      <path
        d="M213 168C192 164 178 146 182 124C202 122 218 134 222 154C224 138 238 128 254 130C256 148 244 164 224 168"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M213 150C202 146 196 134 200 122C212 122 220 132 220 144"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
