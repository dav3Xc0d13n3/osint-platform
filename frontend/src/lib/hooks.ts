import { useEffect, useState } from 'react'

/**
 * Hook to detect prefers-reduced-motion.
 * Returns true if the user prefers reduced motion.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mediaQuery.matches)

    const handler = (event: MediaQueryListEvent) => {
      setReduced(event.matches)
    }

    mediaQuery.addEventListener?.('change', handler)
    return () => mediaQuery.removeEventListener?.('change', handler)
  }, [])

  return reduced
}

/**
 * Hook to get motion variants based on reduced motion preference.
 * Returns the normal variants if reduced motion is not preferred,
 * otherwise returns minimal variants.
 */
export function useMotionVariants<T extends Record<string, any>>(
  normalVariants: T,
  reducedVariants: T
): T {
  const reduced = useReducedMotion()
  return reduced ? reducedVariants : normalVariants
}

/**
 * Hook for animated number counter.
 * Counts up from 0 to target value on mount.
 */
export function useCountUp(
  target: number,
  duration = 1.2,
  delay = 0
): number {
  const [count, setCount] = useState(0)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) {
      setCount(target)
      return
    }

    const startTime = Date.now() + delay
    let animationFrame: number

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000
      const progress = Math.min(elapsed / duration, 1)

      // Easing: easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      setCount(Math.floor(target * eased))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      } else {
        setCount(target)
      }
    }

    if (delay > 0) {
      const timeout = setTimeout(() => {
        animationFrame = requestAnimationFrame(animate)
      }, delay)
      return () => clearTimeout(timeout)
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [target, duration, delay, reduced])

  return count
}

/**
 * Hook for live pulse animation state.
 */
export function usePulse(interval = 2000): boolean {
  const [pulse, setPulse] = useState(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return

    const timer = setInterval(() => {
      setPulse(true)
      setTimeout(() => setPulse(false), 100)
    }, interval)

    return () => clearInterval(timer)
  }, [interval, reduced])

  return pulse
}

/**
 * Hook for blink animation state.
 */
export function useBlink(interval = 1000): boolean {
  const [blink, setBlink] = useState(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return

    const timer = setInterval(() => setBlink(b => !b), interval)
    return () => clearInterval(timer)
  }, [interval, reduced])

  return blink
}

/**
 * Hook for scroll-based animations.
 * Returns whether element is in viewport.
 */
export function useInView(threshold = 0.1): boolean {
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold }
    )

    // This needs to be attached to a ref in the component
    // Usage: const ref = useRef<HTMLDivElement>(null)
    // useEffect(() => { if (ref.current) observer.observe(ref.current) }, [])

    return () => observer.disconnect()
  }, [threshold])

  return inView
}