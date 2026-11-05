# Inner world — implementation and verification

Complete local scene at `/brain/`, linked from home. No eye/entry animation.
Checkpoint of prior user work: 6e31e94. Old brain-atlas code and assets are not imported.

## Stages
- Contract/reference: superior + lateral anatomical reference inspected; source pial
  geometry chosen to preserve real folds rather than procedural sphere deformation.
- Geometry: fsaverage5 left/right cortex prepared in Blender; original stylized
  callosal bridge, cerebellum and brainstem added. These are not clinical segmentations.
- Refinement/materials: smooth normals, teal cortical shading, selected-zone glow,
  sampled surface particles, traveling signals along artistic communication paths.
- Export: 47,616 triangles, 5 meshes, 758 KiB GLB. Editable blend opens and GLB
  fresh-import validation passes. Source rebuild executed in clean Blender 5.2.3.
- Visual: inspected desktop 1440×1000 and mobile 390×844 in Chrome; corrected mobile
  canvas offset and surface transparency. Evidence: `.artifacts/mind/desktop.jpg`,
  `.artifacts/mind/mobile.jpg`. Browser viewport emulation, not a physical-device test.

## Checks
- Six region controls select correct card, state and project URL.
- Skip intro targets #proof; all six projects are HTML and readable without WebGL.
- Reduced motion pauses procedural animation and autorotation; user can resume.
- No horizontal overflow at inspected mobile and desktop sizes.
- No shader/runtime errors in Chrome; shared shader compiled with glslangValidator.
- Fresh Blender import: 5 named meshes, 47,616 triangles.
- Existing Bun tests: 10 pass. Production build: pass (Three.js chunk size warning).
- Production bundle served locally on port 4322 and loaded in Chrome.

## Deployment limitation
This checkout is on cachyos-redmi; the static-caddy Docker socket is absent.
The local dist build therefore did not update the remote site. Public /brain/ returns
404. Existing site and vitals remain reachable. Deploy probe now explicitly checks
/brain/ and its GLB so it cannot report a false success for this feature.

## Scope
Six poetic anatomical mappings, one data source for labels/cards/plain HTML.
No claims of live biometrics, medical localization or actual neural tractography.
Motion pauses offscreen/in background; DPR capped at 1.6. Project/source content
uses existing site URLs. Photo collection and jump scene remain outside this pass.
