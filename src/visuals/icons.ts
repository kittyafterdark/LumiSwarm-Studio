const PORTRAIT_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="3" width="10" height="18" rx="2"/><path d="m10 8 2-2 2 2M12 6v7"/></svg>
`

const LANDSCAPE_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="7" width="18" height="10" rx="2"/><path d="m16 10 2 2-2 2M18 12h-7"/></svg>
`

const RANDOM_SEED_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h3c4 0 6 10 10 10h3M17 14l3 3-3 3M4 17h3c1.5 0 2.7-1.3 3.8-3M14 7c1-1.7 2-3 3-3h3M17 1l3 3-3 3"/><path d="M12 11.5h.01"/></svg>
`

const CURRENT_SEED_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z"/><circle cx="12" cy="10" r="2.2"/><path d="M17.5 3.5 20 1m-1 4h3"/></svg>
`

const LINK_SIZE_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 14.5 14.5 9.5"/><path d="M7.2 16.8 5.7 18.3a3.5 3.5 0 0 1-5-5l3.1-3.1a3.5 3.5 0 0 1 5 0"/><path d="m16.8 7.2 1.5-1.5a3.5 3.5 0 1 1 5 5l-3.1 3.1a3.5 3.5 0 0 1-5 0"/></svg>
`

const BINDING_LINK_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9.5 14.5 5-5"/><path d="M7.2 16.8 5.7 18.3a3.5 3.5 0 0 1-5-5l3.1-3.1a3.5 3.5 0 0 1 5 0"/><path d="m16.8 7.2 1.5-1.5a3.5 3.5 0 1 1 5 5l-3.1 3.1a3.5 3.5 0 0 1-5 0"/></svg>
`

const LIBRARY_ICON = `
  <svg class="ss-library-symbol" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 4v5"/><path d="m7 17 3-3 2 2 2.5-3 2.5 4"/></svg>
`

const INIT_IMAGE_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m6.5 16 3.5-4 2.7 3 2.3-2.5 2.5 3.5"/><circle cx="16.5" cy="8.5" r="1.5"/><path d="M12 2v5m-2-2 2 2 2-2"/></svg>
`

const APPEND_CHAT_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-8l-5 4v-4H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/><path d="M8 10h8m-4-4v8"/></svg>
`

const EXPORT_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m-4-4 4 4 4-4"/><path d="M4 17v3h16v-3"/></svg>
`

const IMPORT_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4m-4 4 4-4 4 4"/><path d="M4 17v3h16v-3"/></svg>
`

const DOWNLOAD_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m-4-4 4 4 4-4"/><path d="M4 18h16"/></svg>
`

const SORT_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h9M4 12h6M4 18h3"/><path d="M17 4v16m-3-3 3 3 3-3"/></svg>
`

const FOLDER_TREE_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h6l2 3h8v12H4z"/><path d="M8 10v6m0-3h4m0 0v3m0-3h4v3"/></svg>
`

const FOLDER_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 6.5h6l2 2h9v10h-17z"/></svg>
`

const SETTINGS_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.82 2.82-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.04 1.56V21h-4v-.08A1.7 1.7 0 0 0 8.96 19.36a1.7 1.7 0 0 0-1.88.34l-.06.06-2.82-2.82.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1.04H3v-4h.04A1.7 1.7 0 0 0 4.6 8.92a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.82-2.82.06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 10 3V3h4v.08a1.7 1.7 0 0 0 1.04 1.48 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.82 2.82-.06.06a1.7 1.7 0 0 0-.34 1.88A1.7 1.7 0 0 0 20.96 10H21v4h-.04A1.7 1.7 0 0 0 19.4 15Z"/></svg>
`

const SEARCH_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>
`

const CHECK_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>
`

const NEW_FOLDER_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 6.5h6l2 2h9v10h-17z"/><path d="M12 11v5M9.5 13.5h5"/></svg>
`

const TRASH_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 3h6l1 4H8zM7 7l1 14h8l1-14M10 11v6M14 11v6"/></svg>
`

const STAR_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m12 3.7 2.55 5.17 5.71.83-4.13 4.03.98 5.69L12 16.73l-5.11 2.69.98-5.69L3.74 9.7l5.71-.83L12 3.7Z"></path>
  </svg>
`

const FAVORITES_FOLDER_ID = "__swarm_studio_favorites__"

const CHAT_VISUALS_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5.5h14v11H8l-3 2.5z"/><path d="M9 9h6m-6 3h4"/><path d="M18.5 2.5c.25 1.55.95 2.25 2.5 2.5-1.55.25-2.25.95-2.5 2.5-.25-1.55-.95-2.25-2.5-2.5 1.55-.25 2.25-.95 2.5-2.5Z"/></svg>
`

const PLUS_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
`

const BACK_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg>
`

const EXPAND_ICON = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M8 3H3v5M16 3h5v5M21 16v5h-5M8 21H3v-5"/>
  </svg>
`

const MINIMIZE_ICON = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M3 8h5V3M21 8h-5V3M21 16h-5v5M3 16h5v5"/>
  </svg>
`

const FRAME_WALL_ICON = `
  <svg viewBox="0 0 457.667 457.667" fill="currentColor" aria-hidden="true">
    <path d="M116.352 141.241h108.759v-38.686H116.352v38.686Zm7-31.686h94.759v24.686h-94.759v-24.686ZM348.908 102.555v38.686h108.759v-38.686H348.908Zm101.759 31.686h-94.759v-24.686h94.759v24.686ZM348.908 277.929h108.759V149.746H348.908v128.183Zm7-121.183h94.759V270.93h-94.759V156.746ZM116.352 355.111h108.759v-38.686H116.352v38.686Zm7-31.685h94.759v24.686h-94.759v-24.686ZM232.704 355.111h224.962v-70.11H232.704v70.11Zm7-63.11h210.962v56.11H239.704v-56.11ZM0 186.087h108.759v-83.531H0v83.531Zm7-76.532h94.759v69.531H7v-69.531ZM341.463 102.555H232.704v83.531h108.759v-83.531Zm-7 76.532h-94.759v-69.531h94.759v69.531ZM341.463 194.398H232.704v83.531h108.759v-83.531Zm-7 76.531h-94.759v-69.531h94.759v69.531ZM0 355.111h108.759V194.398H0v160.713Zm7-153.713h94.759v146.713H7V201.398ZM116.352 309.189h108.759V148.476H116.352v160.713Zm7-153.713h94.759v146.713h-94.759V155.476Z"/>
  </svg>
`

const SPARKLE_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c.7 5.2 2.8 8.3 8 9-5.2.7-7.3 3.8-8 9-.7-5.2-2.8-8.3-8-9 5.2-.7 7.3-3.8 8-9Z"/><path d="M19 2.5c.2 1.7.8 2.7 2.5 3-1.7.3-2.3 1.3-2.5 3-.2-1.7-.8-2.7-2.5-3 1.7-.3 2.3-1.3 2.5-3Z"/></svg>
`
