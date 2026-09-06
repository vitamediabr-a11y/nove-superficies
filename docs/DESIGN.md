# NOVE — Design Direction

## Design Read
Premium local-business marketing site for people evaluating a physical-space investment, with an architectural/editorial visual language derived from grass, field geometry, materiality, and the NOVE rebrand.

## Taste dials
- DESIGN_VARIANCE: 8/10
- MOTION_INTENSITY: 5/10
- VISUAL_DENSITY: 3/10

The page should feel custom and composed, not experimental at the expense of navigation.

## Visual world
- Warm off-white and sand as primary light surfaces.
- Deep NOVE green as structural color.
- Field green only as a controlled accent.
- Charcoal reserved for the before/after contrast section and material imagery.
- No neon, AI purple, generic gradients, glass cards, bento-by-default, floating mockups, or SaaS tropes.
- Sharp geometry and large negative space. Avoid rounded-card language.

## Typography
- Sans-serif only unless the brand supplies a typeface.
- Display copy uses compact line-height and deliberate negative tracking.
- Body copy remains readable at roughly 65–72 characters per line.
- Hero wordmark may exceed normal display scale because it functions as a brand object, not body hierarchy.
- Section display text caps around 96px on desktop.

## Layout families
Every major section must do a different visual job:
1. Hero: asymmetric split composition.
2. Intro: sticky editorial side note + typographic reveal.
3. Solutions: interactive editorial list + sticky material visual.
4. Manifesto: full-bleed kinetic type.
5. Projects: asymmetric brand-media stage + honest portfolio state.
6. Comparison: direct manipulation before/after control.
7. Arenas: sticky field diagram + sequential timeline.
8. Process: staggered editorial sequence, never equal cards.
9. Conversion: full-width green field with an integrated briefing form.

## Motion system
Use motion only for hierarchy, explanation, or feedback.
- UI press: 140ms, ease-out.
- Standard UI state: 220ms, strong ease-out.
- Drawer: 240ms, cubic-bezier(.32,.72,0,1).
- Marketing reveal: ~620ms, cubic-bezier(.23,1,.32,1).
- On-screen morph/emphasis: cubic-bezier(.77,0,.175,1).
- Animate transform/opacity first. clip-path is allowed for authored reveal moments.
- No scroll-jacking, parallax dependency, particle fields, WebGL, or animation library for simple transitions.
- No window scroll event loops. Use IntersectionObserver.
- Hover movement is gated to hover-capable fine pointers.
- Reduced-motion keeps comprehension while removing positional motion.

## Interaction rules
- Pressable elements should have a subtle active state around scale(.97).
- Solution selection must work with click, touch, focus, and arrow keys.
- Before/after slider must work with drag and keyboard arrows/Home/End.
- Mobile menu must restore focus, close on Escape, and trap Tab while open.
- All CTAs must perform a real action.

## Browser surfaces
Theme text selection, caret, scrollbar, underline offset, focus rings, and tabular numerals. These details are part of the product.

## Anti-template checks
- No generic eyebrow + heading pattern repeated across the page.
- No section-number eyebrows.
- No three-equal-benefit cards.
- No fake trust logos or testimonials.
- No decorative pills over images.
- No generic two-CTA centered SaaS hero.
- No repeated reveal class on every section.
- If the logo were removed, the page should still read as a premium surfaces / arena business through photography, material textures, field geometry, and copy.
