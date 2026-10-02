import React from 'react';

interface InvestignitoLogoProps {
  className?: string;
  size?: number;
  showWordmark?: boolean;
  inverted?: boolean;
}

export const InvestignitoLogo: React.FC<InvestignitoLogoProps> = ({
  className = '',
  size = 40,
  showWordmark = false,
  inverted = false,
}) => {
  const fgColor = inverted ? '#000000' : '#ffffff';
  const bandColor = inverted ? '#ffffff' : '#000000';
  const textColor = inverted ? '#000000' : '#ffffff';

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Fedora & Glasses Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-label="Investignito Logo"
      >
        <g transform="translate(0, 5)">
          {/* Fedora Crown */}
          <path
            d="M 194 230
               C 188 195, 194 175, 206 158
               C 218 140, 235 145, 256 160
               C 277 145, 294 140, 306 158
               C 318 175, 324 195, 318 230
               Z"
            fill={fgColor}
          />

          {/* Hat Ribbon / Band */}
          <path
            d="M 188 232
               C 225 244, 287 244, 324 232
               L 326 248
               C 287 261, 225 261, 186 248
               Z"
            fill={bandColor}
          />

          {/* Fedora Wide Curved Brim */}
          <path
            d="M 138 256
               C 178 232, 334 232, 374 256
               C 388 266, 376 288, 342 284
               C 292 278, 220 278, 170 284
               C 136 288, 124 266, 138 256
               Z"
            fill={fgColor}
          />

          {/* Left Sunglasses Lens */}
          <path
            d="M 189 298
               C 189 292, 244 292, 244 298
               C 244 322, 238 333, 216 333
               C 195 333, 189 322, 189 298
               Z"
            fill={fgColor}
          />

          {/* Right Sunglasses Lens */}
          <path
            d="M 268 298
               C 268 292, 323 292, 323 298
               C 323 322, 317 333, 296 333
               C 274 333, 268 322, 268 298
               Z"
            fill={fgColor}
          />

          {/* Sunglasses Bridge */}
          <path
            d="M 242 298
               H 270
               V 305
               H 242
               Z"
            fill={fgColor}
          />
        </g>
      </svg>

      {/* Optional Integrated Wordmark */}
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span
            className="font-display font-black text-xl tracking-tight uppercase"
            style={{ color: textColor }}
          >
            INVESTIGNITO
          </span>
          <span className="text-[10px] font-mono font-bold tracking-widest text-red-500 uppercase mt-0.5">
            WEEKLY CASE PUZZLES
          </span>
        </div>
      )}
    </div>
  );
};

