/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

declare global {
  interface Window {
    particlesJS: any;
  }
}

const PARTICLES_SCRIPT_ID = 'particles-js-script'
const PARTICLES_LOCAL_SRC = '/vendor/particles.min.js'

const initialiseParticles = () => {
  if (!window.particlesJS) {
    return
  }

  if (!document.getElementById('particles-js')) {
    requestAnimationFrame(initialiseParticles)
    return
  }

  window.particlesJS('particles-js', {
        particles: {
          number: {
            value: 80,
            density: {
              enable: true,
              value_area: 800
            }
          },
          color: {
            value: ['#4361ee', '#7209b7', '#22D3EE']
          },
          shape: {
            type: 'circle',
            stroke: {
              width: 0,
              color: '#000000'
            }
          },
          opacity: {
            value: 0.5,
            random: false,
            anim: {
              enable: false,
              speed: 1,
              opacity_min: 0.1,
              sync: false
            }
          },
          size: {
            value: 3,
            random: true,
            anim: {
              enable: false,
              speed: 40,
              size_min: 0.1,
              sync: false
            }
          },
          line_linked: {
            enable: true,
            distance: 150,
            color: '#4361ee',
            opacity: 0.4,
            width: 1
          },
          move: {
            enable: true,
            speed: 2,
            direction: 'none',
            random: false,
            straight: false,
            out_mode: 'out',
            bounce: false,
            attract: {
              enable: false,
              rotateX: 600,
              rotateY: 1200
            }
          }
        },
        interactivity: {
          detect_on: 'canvas',
          events: {
            onhover: {
              enable: true,
              mode: 'repulse'
            },
            onclick: {
              enable: true,
              mode: 'push'
            },
            resize: true
          },
          modes: {
            grab: {
              distance: 400,
              line_linked: {
                opacity: 1
              }
            },
            bubble: {
              distance: 400,
              size: 40,
              duration: 2,
              opacity: 8,
              speed: 3
            },
            repulse: {
              distance: 200,
              duration: 0.4
            },
            push: {
              particles_nb: 4
            },
            remove: {
              particles_nb: 2
            }
          }
        },
        retina_detect: true
      })
}

export const initParticles = () => {
  // Disabled by default: enable explicitly with `VITE_ENABLE_PARTICLES=true`.
  // Also skip in automation (Playwright/webdriver) to avoid flaky external script loads.
  try {
    if (typeof navigator !== 'undefined' && (navigator as any).webdriver) {
      return () => {}
    }
  } catch {
    // ignore
  }

  const enabled = (import.meta as any).env?.VITE_ENABLE_PARTICLES === 'true'
  if (!enabled) {
    return () => {}
  }

  const existingScript = document.getElementById(PARTICLES_SCRIPT_ID) as HTMLScriptElement | null

  if (existingScript) {
    if (existingScript.dataset.initialised === 'true' || window.particlesJS) {
      initialiseParticles()
      existingScript.dataset.initialised = 'true'
      return () => {}
    }

    const onLoad = () => {
      initialiseParticles()
      existingScript.dataset.initialised = 'true'
    }

    existingScript.addEventListener('load', onLoad, { once: true })
    return () => {
      existingScript.removeEventListener('load', onLoad)
    }
  }

  const script = document.createElement('script')
  script.id = PARTICLES_SCRIPT_ID
  // Prefer same-origin to comply with strict CSP; ship `public/vendor/particles.min.js` if enabled.
  script.src = PARTICLES_LOCAL_SRC
  script.async = true

  const onLoad = () => {
    initialiseParticles()
    script.dataset.initialised = 'true'
  }

  script.addEventListener('load', onLoad, { once: true })
  document.head.appendChild(script)

  return () => {
    script.removeEventListener('load', onLoad)
  }
}
