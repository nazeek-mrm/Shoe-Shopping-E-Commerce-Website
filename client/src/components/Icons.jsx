/* Small inline icons so the project has no icon library to install. */
const base = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' }

export const CartIcon   = (p) => <svg {...base} {...p}><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.4 12.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.2L21 7H6"/></svg>
export const HeartIcon  = (p) => <svg {...base} {...p}><path d="M20.1 5.6a4.7 4.7 0 0 0-6.7 0L12 7l-1.4-1.4a4.7 4.7 0 0 0-6.7 6.7l1.4 1.4L12 20.5l6.7-6.8 1.4-1.4a4.7 4.7 0 0 0 0-6.7z"/></svg>
export const ScaleIcon  = (p) => <svg {...base} {...p}><path d="M12 3v18M4 7h16M7 7l-3 6h6zM17 7l-3 6h6z"/></svg>
export const SearchIcon = (p) => <svg {...base} {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
export const MenuIcon   = (p) => <svg {...base} {...p}><path d="M4 7h16M4 12h16M4 17h16"/></svg>
export const PhoneIcon  = (p) => <svg {...base} {...p}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>
export const CheckIcon  = (p) => <svg {...base} {...p}><path d="m5 12.5 4.5 4.5L19 7"/></svg>
export const UserIcon   = (p) => <svg {...base} {...p}><circle cx="12" cy="8" r="3.6"/><path d="M4.5 20c1.4-3.6 4.4-5.5 7.5-5.5s6.1 1.9 7.5 5.5"/></svg>
export const ShoeIcon   = (p) => <svg width={22} height={22} viewBox="0 0 256 256" fill="currentColor" {...p}><path d="m228.65 129.11l-60.73-20.24a24 24 0 0 1-14.32-13L130.39 41.6v-.1a16 16 0 0 0-20.14-8.5L34.53 60.49A16.05 16.05 0 0 0 24 75.53V192a16 16 0 0 0 16 16h200a16 16 0 0 0 16-16v-24.94a40 40 0 0 0-27.35-37.95M115.72 48l7.11 16.63l-21.56 7.85A8 8 0 0 0 104 88a7.9 7.9 0 0 0 2.73-.49l22.4-8.14l4.74 11.07l-16.6 6A8 8 0 0 0 120 112a7.9 7.9 0 0 0 2.73-.49l17.6-6.4a40.2 40.2 0 0 0 7.68 10l-14.74 5.36A8 8 0 0 0 136 136a8.1 8.1 0 0 0 2.73-.48l28-10.18l56.87 18.95A24 24 0 0 1 238.93 160H40V75.53ZM40 192v-16h200v16Z"/></svg>
export const FilterIcon = (p) => <svg {...base} {...p}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
export const EyeIcon    = (p) => <svg {...base} {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
export const EyeOffIcon = (p) => <svg {...base} {...p}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
export const RefreshIcon= (p) => <svg {...base} {...p}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
export const BanIcon    = (p) => <svg {...base} {...p}><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
export const LogoutIcon = (p) => <svg {...base} {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>

