# Somil avatar

This is an original, locally built stylized likeness based on Somil’s reference photos. It is not a scan or a trained reconstruction. Reference photos are not embedded in the model or sent to an external service.

- `somil-avatar.glb`: reusable glTF 2.0 binary; 104 meshes, approximately 2.7 MB. Has named shoulder, elbow, leg, and head groups. It does not have a skeletal skin or baked animation clips.
- `../scripts/avatar-model.js`: source for the geometry and materials.
- `../scripts/avatar-scene.js`: lighting, rendering, scroll position, idle movement, drag rotation, and contact wave.
- `../styles/avatar-experience.css`: responsive presentation layer over the original master stylesheet.

The website builds the same geometry from its local JavaScript source, avoiding a separate model download at runtime. `somil-avatar.glb` is for reuse in other 3D tools.

To regenerate the export with Node 22 or newer:

```sh
node tools/export-avatar.mjs
```

To preview the portfolio from its repository root:

```sh
python3 -m http.server 8766 --bind 127.0.0.1
```

Then open http://127.0.0.1:8766/. ES modules need HTTP; double-clicking index.html is not supported. Three.js 0.180.0 is vendored locally with its MIT license. Existing Google Fonts and the contact form service are retained.

Reduced motion disables the character’s idle, turning, and waving animation. The pause control provides the same option. The original portrait is the fallback when WebGL cannot initialize. On phones, the avatar becomes a compact companion, ignores touch input outside the hero, and hides while a contact field has focus. Rendering stops while the page is hidden.
