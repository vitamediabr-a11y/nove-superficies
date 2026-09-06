# NOVE — Skills Applied

This build was reviewed through three complementary lenses: Emil Kowalski's design-engineering/animation discipline, Impeccable's craft and polish floor, and `design-taste-frontend`'s anti-slop redesign protocol.

## Design read
Premium local-business marketing site for a high-consideration physical-space purchase, using an architectural/editorial language derived from the NOVE identity, surface materiality, synthetic grass, and field geometry.

## Taste dials
- DESIGN_VARIANCE: 8/10
- MOTION_INTENSITY: 5/10
- VISUAL_DENSITY: 3/10

## Applied changes
- Replaced template-like repeated cards with distinct section layout families.
- Kept one authored hero entrance and limited the rest of motion to hierarchy, state, and feedback.
- Uses strong ease-out/ease-in-out motion tokens, specific transition properties, pointer gating, and reduced-motion fallbacks.
- Removed duplicate persistent CTA from the hero; contextual CTAs appear only after the hero leaves the viewport.
- Added active press feedback and consistent keyboard-visible focus treatment.
- Solution selector supports pointer, touch, focus, and arrow-key navigation.
- Mobile menu traps focus, closes on Escape, restores focus, and removes motion for keyboard-triggered open/close.
- Before/after comparison supports drag plus Arrow/Home/End keyboard control.
- No scroll event loop: IntersectionObserver drives header state, reveal moments, timeline state, and persistent CTA visibility.
- The project area does not invent clients, projects, testimonials, or statistics.
- Browser-level surfaces are themed: selection, caret, scrollbar, focus, underline offset.
- Assets reserve dimensions and below-fold imagery is lazy loaded; the hero image is preloaded.
- Mobile composition is intentional rather than a compressed desktop layout.
- Real NOVE brand assets and field geometry carry the visual identity instead of generic SaaS decoration.

## Shipping checks
- No `transition: all`.
- No `window.addEventListener('scroll', ...)` animation loop.
- No generic purple/blue gradient or glass-card visual language.
- No fake social proof.
- No section-number eyebrows.
- No redundant persistent CTA in the first viewport.
- Internal anchors resolve.
- JavaScript syntax validates with Node.
- Mobile menu and solution keyboard interactions were exercised in a headless browser.
- Persistent CTAs were verified hidden in the hero and visible after the hero on desktop and mobile.
