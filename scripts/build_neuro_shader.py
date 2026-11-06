"""Bundle the shared homepage field into the 3D material and standalone preview.
Usage: python3 scripts/build_neuro_shader.py /path/to/shader-art-coding/scripts/glsl_tools.py
"""
from pathlib import Path
import subprocess,sys,tempfile
root=Path(__file__).resolve().parents[1]
tool=Path(sys.argv[1]).resolve()
source=(root/'src/shaders/cortex.source.glsl').read_text().replace('// @neuro-kernel',(root/'src/shaders/neuro-kernel.glsl').read_text())
with tempfile.TemporaryDirectory() as folder:
 shader=Path(folder)/'cortex.glsl';shader.write_text(source)
 subprocess.run([sys.executable,str(tool),'bundle',str(shader),'-o',str(root/'src/shaders/cortex.glsl')],check=True)
preview=root/'assets/mind/shader-preview.glsl'
preview.write_text((root/'src/shaders/cortex.glsl').read_text()+(root/'src/shaders/cortex-preview.glsl').read_text())
subprocess.run([sys.executable,str(tool),'check',str(preview)],check=True)
