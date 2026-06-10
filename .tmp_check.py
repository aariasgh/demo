from pathlib import Path
import sys
print('PYTHON', sys.version)
try:
    import yaml
    print('YAML_OK')
except Exception as e:
    print('YAML_ERR', repr(e))
