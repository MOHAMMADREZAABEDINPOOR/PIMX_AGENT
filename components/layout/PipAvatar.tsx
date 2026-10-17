import type { Ref } from 'react';

/** Articulated vector rig: the gait controller positions each paw and hock. */
export function PipAvatar({ id, ref }: { id: string; ref: Ref<SVGSVGElement> }) {
  const leg = (hip: number, far = false) => <g key={`${hip}-${far}`} data-leg data-hip={hip} data-far={far} opacity={far ? 0.58 : 1}>
    <path d={`M${hip} 65L${hip - 5} 75L${hip} 86`} stroke={far ? '#54536e' : `url(#${id}-metal)`} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx={hip - 5} cy="75" r="2.5" fill="#161b2c" stroke="#a8b2ce" strokeWidth=".8"/>
    <rect x={hip - 4} y="84" width="10" height="5" rx="2.3" fill={far ? '#44485e' : '#c1cbe0'}/>
  </g>;
  return <svg ref={ref} className="pet-avatar" viewBox="0 0 120 108" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id={`${id}-shell`} x1="36" y1="29" x2="76" y2="76" gradientUnits="userSpaceOnUse"><stop stopColor="#e6eaf7"/><stop offset=".48" stopColor="#a8b5d2"/><stop offset="1" stopColor="#67728f"/></linearGradient>
      <linearGradient id={`${id}-metal`} x1="30" y1="63" x2="35" y2="88" gradientUnits="userSpaceOnUse"><stop stopColor="#b1bdd7"/><stop offset="1" stopColor="#707e9f"/></linearGradient>
      <linearGradient id={`${id}-accent`} x1="20" y1="20" x2="90" y2="65" gradientUnits="userSpaceOnUse"><stop stopColor="var(--accent-color)"/><stop offset="1" stopColor="#363255"/></linearGradient>
      <linearGradient id={`${id}-visor`} x1="56" y1="34" x2="89" y2="63" gradientUnits="userSpaceOnUse"><stop stopColor="#232e48"/><stop offset="1" stopColor="#0a1021"/></linearGradient>
    </defs>
    <ellipse className="pip-ground" cx="57" cy="91" rx="39" ry="4" fill="#111827" opacity=".2"/>
    {leg(38, true)}{leg(72, true)}
    <g className="pip-torso">
      <g className="pip-tail"><path d="M33 64C14 65 8 47 15 33C20 43 28 43 35 53" fill={`url(#${id}-accent)`} stroke="#b0b7dc" strokeWidth="1"/><path d="M15 33C18 39 21 41 25 44L17 49C13 44 12 39 15 33" fill="#e7eafb"/></g>
      <path d="M30 53Q37 44 55 47L74 53L78 65Q64 77 40 72Q28 68 30 53Z" fill={`url(#${id}-shell)`} stroke="#dce4f7" strokeWidth="1"/>
      <path d="M35 56Q43 49 53 52L59 62L49 69L35 65Z" fill={`url(#${id}-accent)`}/>
      <path d="M40 56L47 54M39 60L46 58M39 64L46 62" stroke="#d0c7ff" strokeWidth="1.4" strokeLinecap="round" opacity=".7"/>
      <circle cx="67" cy="64" r="6" fill="#37415d" stroke="#e0e7fb" strokeWidth="1.5"/><circle className="pip-power" cx="67" cy="64" r="2.5" fill="var(--accent-color)"/>
      <g className="pip-head">
        <g className="pip-ear pip-ear-far"><path d="M59 36L53 12Q53 9 57 12L72 29" fill="#7b86a5" stroke="#c2cde2"/><path d="M59 27L57 17L65 28" fill="var(--accent-color)"/></g>
        <g className="pip-ear pip-ear-near"><path d="M77 32L89 10Q91 7 92 12L92 37" fill={`url(#${id}-shell)`} stroke="#e2e9f9"/><path d="M83 29L89 17L89 33" fill="var(--accent-color)"/></g>
        <path d="M53 36Q62 25 80 29Q93 31 96 44L100 54L91 65Q69 72 53 59L49 46Z" fill={`url(#${id}-shell)`} stroke="#e0e7f8" strokeWidth="1.1"/>
        <path d="M58 38Q70 32 87 38Q94 41 94 51Q92 61 77 62Q61 62 57 55Q52 48 58 38Z" fill={`url(#${id}-visor)`} stroke="#4e5c7c" strokeWidth="1"/>
        <path d="M60 39Q72 35 84 39" stroke="#8fabc9" strokeWidth=".8" opacity=".45"/>
        <g className="pet-gaze"><g className="pip-eyes"><path d="M65 45V50M83 44V49" stroke="#9df8ec" strokeWidth="4" strokeLinecap="round"/><circle cx="65.5" cy="44.8" r=".8" fill="white"/><circle cx="83.5" cy="43.8" r=".8" fill="white"/></g></g>
        <path className="pip-mouth" d="M72 55Q76 58 80 54" stroke="#9df8ec" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M94 48L100 51L96 55" fill="#3f4c69"/><path d="M55 54L60 57" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round"/>
      </g>
    </g>
    {leg(32)}{leg(67)}
    <g className="pip-prop pip-lens"><path d="M89 63L100 76" stroke="#c3cde3" strokeWidth="4" strokeLinecap="round"/><circle cx="86" cy="59" r="10" fill="#132d3e" fillOpacity=".7" stroke="#b8c9e6" strokeWidth="2.5"/><path d="M81 55Q85 51 90 55" stroke="#99f6e4" strokeWidth="1.5" strokeLinecap="round"/></g>
    <g className="pip-prop pip-console"><path d="M50 83L87 83L99 68L64 68Z" fill="#232c45" stroke="#9caecf" strokeWidth="1"/><path d="M64 72H84M60 76H76" stroke="#99f6e4" strokeWidth="1.5" strokeLinecap="round"/><path className="pip-cursor" d="M81 76H87" stroke="var(--accent-color)" strokeWidth="2"/></g>
    <g className="pip-prop pip-thought" fill="#bac5df"><circle cx="97" cy="32" r="2"/><circle cx="105" cy="23" r="3"/><path d="M103 12H116M110 6V18" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round"/></g>
    <g className="pip-prop pip-celebration" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round"><path d="M22 13V23M17 18H27M102 35V43M98 39H106M43 5V11M40 8H46"/></g>
    <g className="pip-prop pip-error"><path d="M103 14L114 33H92Z" fill="#f59e0b" stroke="#fef3c7"/><path d="M103 21V25M103 28V29" stroke="#422006" strokeWidth="2" strokeLinecap="round"/></g>
    <g className="pip-prop pip-sleep" stroke="#9caecf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M92 31H99L92 38H99M101 17H111L101 27H111"/></g>
  </svg>;
}
