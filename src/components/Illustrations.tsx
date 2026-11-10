import type { ReactNode } from 'react';

/**
 * `frame` is the part of the drawing that must always show. Every frame is the same size, so
 * all the drawings match in scale, and the background runs past it to fill wider spaces.
 */
function Scene({ children, frame }: { children: ReactNode; frame: string }) {
  return (
    <svg className="art" viewBox={frame} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      {children}
    </svg>
  );
}

/** An orange cat asleep on its cushion, next to a warm mug. */
const SleepingCat = () => (
  <Scene frame="24 48 206 140">
    <rect x="-400" y="-400" width="1040" height="1000" fill="#f8e6d4" />
    <circle cx="186" cy="44" r="58" fill="#fdf3e8" />
    <rect x="-400" y="160" width="1040" height="500" fill="#efc9a8" />
    <ellipse cx="106" cy="164" rx="74" ry="15" fill="#ffffff" />
    <g className="breathing">
      <path
        d="M58 154c-3-34 18-62 56-62 36 0 60 26 60 52 0 10-6 16-15 16H70c-7 0-11-2-12-6z"
        fill="#e8944a"
      />
      <path
        d="M116 93c3 7 3 14 1 21M136 97c0 8-2 15-6 21M154 108c-2 7-6 13-11 18"
        fill="none"
        stroke="#c8702c"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M170 136c5 14-3 25-19 25h-44"
        fill="none"
        stroke="#d97f36"
        strokeWidth="13"
        strokeLinecap="round"
      />
      <path d="M150 155v12M132 155v12" fill="none" stroke="#c8702c" strokeWidth="5" />
      <path d="M106 161h5" fill="none" stroke="#fbe7d6" strokeWidth="13" strokeLinecap="round" />
    </g>
    <path
      d="M53 110l1-21 20 11zM99 110l-1-21-20 11z"
      fill="#e8944a"
      stroke="#e8944a"
      strokeWidth="4"
      strokeLinejoin="round"
    />
    <path d="M58 103l.5-8 8 4.500zM94 103l-.5-8-8 4.500z" fill="#f7c9a4" />
    <ellipse cx="76" cy="127" rx="32" ry="28" fill="#e8944a" />
    <path
      d="M76 102v8M68 104l1.500 6M84 104l-1.500 6"
      fill="none"
      stroke="#c8702c"
      strokeWidth="3.500"
      strokeLinecap="round"
    />
    <ellipse cx="76" cy="139" rx="14" ry="10.500" fill="#fbe7d6" />
    <path
      d="M57 125c3 3.500 8 3.500 11 0M84 125c3 3.500 8 3.500 11 0"
      fill="none"
      stroke="#3b2a1e"
      strokeWidth="2.400"
      strokeLinecap="round"
    />
    <path d="M73 134h6l-3 3.500z" fill="#c9604f" />
    <path
      d="M76 137.500c0 3-3 4-5 2.500M76 137.500c0 3 3 4 5 2.500"
      fill="none"
      stroke="#3b2a1e"
      strokeWidth="1.400"
      strokeLinecap="round"
    />
    <circle cx="54" cy="135" r="4.500" fill="#f2b184" />
    <circle cx="98" cy="135" r="4.500" fill="#f2b184" />
    <ellipse cx="63" cy="155" rx="11" ry="6.500" fill="#fbe7d6" />
    <ellipse cx="89" cy="155" rx="11" ry="6.500" fill="#fbe7d6" />
    <path d="M181 129h34v21a14 14 0 0 1-14 14h-6a14 14 0 0 1-14-14z" fill="#4f6f7e" />
    <path d="M215 134h5a7 7 0 0 1 0 14h-6" fill="none" stroke="#4f6f7e" strokeWidth="5" />
    <ellipse cx="198" cy="130" rx="17" ry="4" fill="#5e4230" />
    <path
      className="steam"
      d="M190 118c-5-6 5-9 0-16M204 118c-5-6 5-9 0-16"
      fill="none"
      stroke="#ffffff"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </Scene>
);

/** A moonlit window with a small plant on the sill. */
const MoonWindow = () => (
  <Scene frame="17 24 206 140">
    <rect x="-400" y="-400" width="1040" height="1000" fill="#b3c6cd" />
    <circle cx="36" cy="40" r="50" fill="#c6d6db" />
    <rect x="66" y="26" width="108" height="124" rx="54" fill="#3f5a69" />
    <path d="M136 56a26 26 0 1 0 17 45 22 22 0 0 1-17-45z" fill="#f5e5bf" />
    <circle className="twinkle" cx="92" cy="64" r="2.500" fill="#f5e5bf" />
    <circle cx="108" cy="104" r="2" fill="#f5e5bf" />
    <circle className="twinkle later" cx="88" cy="118" r="2.500" fill="#f5e5bf" />
    <path d="M120 26v124M66 88h108" stroke="#ffffff" strokeWidth="5" />
    <rect x="50" y="150" width="140" height="11" rx="5" fill="#ffffff" />
    <path d="M71 150l-3-13h22l-3 13z" fill="#c9835b" />
    <path
      d="M79 137c-9-4-12-11-10-19 7 2 11 8 10 19zM79 137c8-4 12-12 10-22-8 3-11 11-10 22z"
      fill="#4f7267"
    />
    <rect x="-400" y="182" width="1040" height="500" fill="#8fa8b1" />
  </Scene>
);

/** A paint palette and brush. */
const PaintPalette = () => (
  <Scene frame="27 20 206 140">
    <rect x="-400" y="-400" width="1040" height="1000" fill="#cdb9cc" />
    <circle cx="44" cy="46" r="54" fill="#ddcedc" />
    <path
      d="M121 50c-44 0-74 26-74 58 0 31 28 50 60 50 13 0 20-8 18-18-2-11 2-18 15-18h22c19 0 32-11 32-29 0-25-31-43-73-43z"
      fill="#ffffff"
    />
    <circle cx="91" cy="89" r="10" fill="#4f7267" />
    <circle cx="125" cy="74" r="10" fill="#c9835b" />
    <circle cx="158" cy="88" r="10" fill="#4f6f7e" />
    <circle cx="85" cy="124" r="10" fill="#e3ab85" />
    <g className="brush">
      <path d="M207 24l11 11-58 66-16 6 5-17z" fill="#83637f" />
      <path d="M149 90l11 11-16 6z" fill="#22302f" />
    </g>
  </Scene>
);

/** A small castle under the moon, for the fantasy world in Story. */
const NightCastle = () => (
  <Scene frame="22 32 206 140">
    <rect x="-400" y="-400" width="1040" height="1000" fill="#4f7267" />
    <circle cx="186" cy="48" r="20" fill="#f5e5bf" />
    <circle className="twinkle" cx="40" cy="36" r="2.500" fill="#f5e5bf" />
    <circle cx="84" cy="24" r="2" fill="#f5e5bf" />
    <circle className="twinkle later" cx="125" cy="46" r="2.500" fill="#f5e5bf" />
    <rect x="-400" y="158" width="1040" height="500" fill="#3b5a50" />
    <path d="M0 158c54-30 112-30 240 0z" fill="#3b5a50" />
    <path d="M74 150V82l14-26 14 26v24h36V82l14-26 14 26v68z" fill="#ffffff" />
    <path d="M74 82l14-26 14 26zM138 82l14-26 14 26z" fill="#c9835b" />
    <path d="M108 150v-20a12 12 0 0 1 24 0v20z" fill="#8e5d44" />
    <rect x="84" y="92" width="8" height="13" rx="4" fill="#e3ab85" />
    <rect x="148" y="92" width="8" height="13" rx="4" fill="#e3ab85" />
  </Scene>
);

/** Two cards, with arrows either side of them. */
export const FlipCardsScene = () => (
  <Scene frame="17 30 206 140">
    <rect x="-400" y="-400" width="1040" height="1000" fill="#b3c6cd" />
    <circle cx="48" cy="48" r="52" fill="#c6d6db" />
    <g className="anim-back-card">
      <g transform="rotate(-8 120 100)">
        <rect x="82" y="46" width="76" height="104" rx="10" fill="#e9eff1" />
      </g>
    </g>
    <g className="anim-front-card">
      <g transform="rotate(5 124 100)">
        <rect x="86" y="44" width="76" height="104" rx="10" fill="#ffffff" />
        <path d="M86 130h76v8a10 10 0 0 1-10 10H96a10 10 0 0 1-10-10z" fill="#4f6f7e" />
        <rect x="96" y="58" width="46" height="7" rx="3.500" fill="#22302f" />
        <rect x="96" y="71" width="56" height="7" rx="3.500" fill="#22302f" />
        <rect x="96" y="84" width="34" height="7" rx="3.500" fill="#22302f" />
      </g>
    </g>
    <g className="anim-arrow-left">
      <rect x="36" y="82" width="32" height="32" rx="10" fill="#ffffff" />
      <path
        d="M56 90l-8 8 8 8"
        fill="none"
        stroke="#4f6f7e"
        strokeWidth="3.500"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <g className="anim-arrow-right">
      <rect x="172" y="82" width="32" height="32" rx="10" fill="#ffffff" />
      <path
        d="M184 90l8 8-8 8"
        fill="none"
        stroke="#4f6f7e"
        strokeWidth="3.500"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </Scene>
);

/** An open notebook and pen, for answering however you like. */
export const NotebookScene = () => (
  <Scene frame="17 30 206 140">
    <rect x="-400" y="-400" width="1040" height="1000" fill="#cdb9cc" />
    <circle cx="190" cy="50" r="50" fill="#ddcedc" />
    <rect x="46" y="58" width="148" height="96" rx="8" fill="#83637f" />
    <path d="M120 66c-16-8-40-10-66-8v86c26-2 50 0 66 8z" fill="#ffffff" />
    <path d="M120 66c16-8 40-10 66-8v86c-26-2-50 0-66 8z" fill="#f5f8f9" />
    <path
      className="anim-line"
      pathLength="1"
      d="M66 78c14-1 28 0 42 4"
      fill="none"
      stroke="#b6c8ce"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path
      className="anim-line second"
      pathLength="1"
      d="M66 94c14-1 28 0 42 4"
      fill="none"
      stroke="#b6c8ce"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path
      className="anim-line third"
      pathLength="1"
      d="M66 110c14-1 28 0 42 4"
      fill="none"
      stroke="#b6c8ce"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path
      className="anim-line fourth"
      pathLength="1"
      d="M132 82c14-4 28-5 42-4"
      fill="none"
      stroke="#b6c8ce"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <g className="anim-pen">
      <g transform="rotate(38 158 100)">
        <rect x="152" y="58" width="11" height="56" rx="3" fill="#4f6f7e" />
        <path d="M152 114h11l-5.500 13z" fill="#22302f" />
      </g>
    </g>
  </Scene>
);

/** A finished card with a big check mark. */
export const DoneCardScene = () => (
  <Scene frame="17 30 206 140">
    <rect x="-400" y="-400" width="1040" height="1000" fill="#b9cdc4" />
    <circle cx="50" cy="150" r="56" fill="#cbdbd3" />
    <g transform="rotate(4 120 100)">
      <rect x="82" y="44" width="76" height="106" rx="10" fill="#e9eff1" />
    </g>
    <rect x="80" y="42" width="80" height="108" rx="11" fill="#ffffff" />
    <path d="M80 130h80v9a11 11 0 0 1-11 11H91a11 11 0 0 1-11-11z" fill="#4f7267" />
    <circle className="anim-pop" cx="120" cy="86" r="26" fill="#4f7267" />
    <path
      className="anim-check"
      pathLength="1"
      d="M108 87l9 9 16-18"
      fill="none"
      stroke="#ffffff"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      className="twinkle"
      d="M184 62v14M177 69h14"
      stroke="#ffffff"
      strokeWidth="3.500"
      strokeLinecap="round"
    />
    <path
      className="twinkle later"
      d="M56 76v10M51 81h10"
      stroke="#ffffff"
      strokeWidth="3.500"
      strokeLinecap="round"
    />
  </Scene>
);

/** The sun coming up behind four new cards, one for each stack. */
export const NewDayScene = () => (
  <Scene frame="17 30 206 140">
    <rect x="-400" y="-400" width="1040" height="1000" fill="#f0c4a1" />
    <g className="anim-sun">
      <circle cx="120" cy="118" r="62" fill="#f6d6bc" />
      <circle cx="120" cy="118" r="38" fill="#fbe7d6" />
    </g>
    <rect x="-400" y="130" width="1040" height="200" fill="#dfa17b" />
    {[
      [46, '#a9623c'],
      [84, '#4f6f7e'],
      [122, '#83637f'],
      [160, '#4f7267'],
    ].map(([x, color], order) => (
      <g key={color} className="anim-deal" style={{ animationDelay: `${0.25 + order * 0.11}s` }}>
        <rect x={x} y="96" width="34" height="50" rx="6" fill="#ffffff" />
        <path d={`M${x} 134h34v6a6 6 0 0 1-6 6h-22a6 6 0 0 1-6-6z`} fill={color as string} />
        <rect x={Number(x) + 6} y="104" width="22" height="4" rx="2" fill="#22302f" />
        <rect x={Number(x) + 6} y="113" width="15" height="4" rx="2" fill="#22302f" />
      </g>
    ))}
  </Scene>
);

const SCENES = [SleepingCat, MoonWindow, PaintPalette, NightCastle];

export function Illustration({ cat }: { cat: number }) {
  const Art = SCENES[cat];
  return <Art />;
}
