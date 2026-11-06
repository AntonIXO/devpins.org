# Anatomical CV — final state

Both /cv/ and /brain/ use MindLayout.astro, BaseHead, SiteNav, the existing IBM Plex
fonts, paper/ink tokens and theme control. The old brain experiment is not imported.

## Interaction and complete content
- Six atlas-labelled territories, raycast selection on the actual meshes.
- Selected cortical parts separate outward; previous selection returns. Motion
  uses an interruptible 280 ms ease-in-out tween, with immediate reduced-motion updates.
- Object-space neural texture and labels follow the moving parts. Orbit drag does not select a project.
- Fixed 50/50 desktop view: brain on the left, one paginated CV entry on the right.
  One compact summary index, no page or panel scrolling. Mobile stacks the brain
  above the reader and keeps the index collapsible within the same viewport.
- Seven original projects plus education, skills, sport, awards and contact/about.
  All dates, nonempty bullets, team note, contact URLs and inline sources retained.
- cv.ts remains the source of CV text. The summary selects one entry at a time;
  multiple projects in one territory remain independently accessible.
- YouTube video loads on request; GitHub account/repository cards use a dated public
  API snapshot. Other CV URLs use external link previews. Dream Walker has its
  published preview image; its live iframe was blank in browser testing, so it is
  not presented as an embedded working game. External links remain available. Switching entry unloads embedded frames. No hidden autoplay.
- HTML contains all CV entries; noscript and print expose the complete text.

## Anatomy and asset
Inspected the superior and lateral reference recorded in README.md. Source pial
geometry preserves approximately 140 x 174 x 128 mm proportions by uniform scaling.
The earlier squat appearance was foreshortening and translucent/veined shading.
The new lateral/anterior camera and matte regional shading expose the silhouette.

Left/right Destrieux fsaverage5 labels are grouped into frontal, motor, parietal,
temporal, occipital and insular territories. Every original cortex triangle is
assigned exactly once. Grouping and original label names are in regions.json.
Parcel boundaries are smoothed, subdivided, decimated and given capped thickness
for the exploded presentation. These are illustrative cortical shells, not a
clinical volumetric segmentation. Neutral supporting forms are authored approximations
and do not act as CV region targets. Project-region associations are metaphors.

Export: 17 named meshes, 241,432 triangles, about 4.2 MiB GLB. Fresh Blender import
verifies evaluated modifier output and region metadata, not just the source mesh.
Durable source: scripts/build_mind.py; editable asset: assets/mind/mind.blend.

## Health and verification
Shared homepage health palette, sleep shading, cardiac envelope and HRV mapping.
EEG-style trace is synthetic and labelled as such. optiHealth snapshot source/date
or fallback status are shown. No raw EEG data is claimed.

17 Bun tests pass; production build succeeds; standalone material compile checked
with glslangValidator. Chrome desktop/mobile checks confirm exactly one visible
entry, one summary, all seven projects and five supporting sections reachable,
no horizontal overflow, working dark/light theme and selection movement.
YouTube player rendered with the linked firmware video's poster. GitHub cards
render source repositories; frames unload on switching. These are browser viewport
checks, not physical-device certification.

Production is not deployed from this laptop. Local compiled preview is port 4322;
dev preview is port 4321. Remote deployment still requires the server checkout.

## Neuro Noise material (replaces the vascular experiment)
Removed the 390-branch TubeGeometry overlay, all 2,708 dot sprites and their loader.
The homepage's original six-stage Neuro Noise field now lives in neuro-kernel.glsl
and is used by both the homepage and the 3D material. Homepage equations and field
parameters are unchanged. The 3D adaptation uses object-space triplanar sampling,
verified library noise for the small domain warp, anatomical lighting and mild
regional tint. Same palette progression, time scale, grain and health mapping.
No geometry/label pulsation, no literal wires or bead particles. Region selection,
50/50 layout and pagination remain intact. Apache-2.0 attribution is retained.
Regenerate the bundle/preview with scripts/build_neuro_shader.py and the skill's
glsl_tools.py path. A source consistency test prevents generated-kernel drift.

## Split-view verification
Desktop 1440x1000: brain width 720 px, document height exactly 1000 px.
Mobile 390x844: document exactly 390x844, no overflow; descriptions and YouTube
remain accessible through page controls. Long GitHub cards paginate intact.
All 12 summary entries remain selectable with exactly one visible CV article.
CSS columns preserve the original content; off-page links are removed from tab
order and restored when their page is selected. No scrollIntoView is used.
