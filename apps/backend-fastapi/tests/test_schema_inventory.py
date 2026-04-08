import importlib.util
import unittest
from pathlib import Path


SCRIPT_PATH = Path(__file__).resolve().parents[3] / "scripts" / "validate_schema_inventory.py"


spec = importlib.util.spec_from_file_location(
    "validate_schema_inventory",
    SCRIPT_PATH,
)
module = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(module)


class SchemaInventoryTest(unittest.TestCase):
    def test_inventory_matches_checked_in_migrations(self):
        errors = module.validate_schema_inventory()
        self.assertEqual(errors, [])


if __name__ == "__main__":
    unittest.main()
