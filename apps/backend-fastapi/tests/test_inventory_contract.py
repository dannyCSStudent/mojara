import unittest
from pathlib import Path


MIGRATION_PATH = (
    Path(__file__).resolve().parents[3]
    / "supabase"
    / "migrations"
    / "202603230001_inferred_baseline.sql"
)


class InventoryContractTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sql = MIGRATION_PATH.read_text()

    def test_inventory_events_track_explicit_cause_and_reference_order(self):
        self.assertIn("cause text not null default 'manual_edit'", self.sql)
        self.assertIn("reference_order_id uuid references public.orders(id)", self.sql)
        self.assertIn(
            "check (cause in ('product_created', 'manual_edit', 'manual_availability', 'order_created', 'order_canceled'))",
            self.sql,
        )

    def test_log_inventory_event_reads_transaction_local_metadata(self):
        self.assertIn("create or replace function public.log_inventory_event()", self.sql)
        self.assertIn("current_setting('app.inventory_event_cause', true)", self.sql)
        self.assertIn("current_setting('app.inventory_reference_order_id', true)", self.sql)

    def test_order_functions_stamp_inventory_cause_metadata(self):
        self.assertIn(
            "perform set_config('app.inventory_event_cause', 'order_created', true);",
            self.sql,
        )
        self.assertIn(
            "perform set_config('app.inventory_reference_order_id', v_order.id::text, true);",
            self.sql,
        )
        self.assertIn(
            "perform set_config('app.inventory_event_cause', 'order_canceled', true);",
            self.sql,
        )
        self.assertIn(
            "perform set_config('app.inventory_reference_order_id', p_order_id::text, true);",
            self.sql,
        )


if __name__ == "__main__":
    unittest.main()
