# Inner world — new asset contract

No source, geometry, or scene code from the previous brain-atlas experiment is used.

Anatomical foundation: FreeSurfer fsaverage5 pial surfaces, distributed by Nilearn:
https://github.com/nilearn/nilearn/tree/main/nilearn/datasets/data/fsaverage5
https://nilearn.github.io/dev/modules/description/fsaverage5.html
Fischl et al., Human Brain Mapping 8(4):272–284, 1999.
Modified: normalized coordinates, Blender materials, added stylized callosal bridge,
brainstem and cerebellum. This is not Anton's scan. Project mappings are metaphors.
License: FreeSurfer Software License (covers software and data), included alongside export.

Reference inspected: https://img.brainkart.com/imagebk22/cucElEF.jpg
Superior and lateral views: paired hemispheres with deep median fissure; anterior
mass rounder than posterior; temporal lobe lower/lateral; cerebellum posterior/inferior.
Reference image is not redistributed. Pial geometry preserves source folds and proportions.
Supporting structures are approximate, not a clinical atlas.

Contract: smooth recognizable brain, about 50k triangles, six keyboard-accessible
project regions, orbit without scroll capture, teal/amber neural shader and traveling
signals. No eye or camera-entry animation. Review perspective, lateral and mobile.
Deliver: durable build script, editable blend, GLB, source shaders and browser evidence.

## Atlas partition revision
Cortical labels: Destrieux 2009, fsaverage5, as distributed by FreeSurfer/Nilearn.
https://nilearn.github.io/stable/modules/generated/nilearn.datasets.fetch_atlas_surf_destrieux.html
https://www.nitrc.org/frs/download.php/9343/lh.aparc.a2009s.annot
https://www.nitrc.org/frs/download.php/9342/rh.aparc.a2009s.annot

Each original cortex triangle is assigned once by majority vertex label. Exact
parcel groupings and surface-derived anchors are in public/mind/regions.json.
The source geometry uses uniform /45 scaling, preserving its roughly 140 × 174 ×
128 mm proportions. A right lateral/anterior view replaces the foreshortened rear
view. Shell boundaries are smoothed, subdivided once and thickened for a readable
exploded display; it is an illustrative anatomical surface, not a clinical model.
Cerebellum/brainstem/callosal supporting forms remain authored approximations;
they are neutral and not used as project-region hit targets. All six interactive
territories are based on cortical atlas parcels. CV associations are metaphors.
