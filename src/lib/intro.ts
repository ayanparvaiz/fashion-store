/** sessionStorage flag set once the brand intro has played. */
export const INTRO_SESSION_KEY = "fs:intro";

/**
 * Runs in <head> before first paint: marks the intro as done for the rest of
 * the session (or when reduced motion is on) so the preloader never flashes.
 */
export const INTRO_GATE_SCRIPT = `try{if(sessionStorage.getItem("${INTRO_SESSION_KEY}")||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.dataset.intro="done"}catch(e){}`;
