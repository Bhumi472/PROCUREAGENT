
import logging
import os
import re
from typing import Any, Dict, List

import pandas as pd

logger = logging.getLogger("procureagent.mcp.doc_parser")


class DocParserMCPServer:
    """Parse CSV and Excel BOM files into structured line items."""

    COLUMN_ALIASES = {
        "part_number": [
            "part_number", "part number", "partno", "part", "item",
            "code", "id", "item number", "sku",
        ],
        "description": [
            "description", "name", "title", "item description",
            "product description",
        ],
        "quantity": [
            "quantity", "qty", "count", "units", "order quantity",
        ],
        "material_spec": [
            "material_spec", "material spec", "material", "spec",
            "specification",
        ],
        "target_price": [
            "target_price", "target price", "price", "cost", "rate",
            "unit price", "unit cost",
        ],
    }

    COMPANY_COLUMNS = {
        "company", "company_name", "company name", "vendor",
        "vendor_name", "vendor name", "supplier", "supplier_name",
        "manufacturer", "organization", "client", "enterprise",
        "project",
    }

    def derive_company_name_from_filename(self, file_path: str) -> str:
        """Derive a readable company name from the filename."""
        basename = os.path.basename(file_path)
        cleaned = re.sub(
            r"^uploaded_[a-f0-9]+_",
            "",
            basename,
            flags=re.IGNORECASE,
        )
        name_part = os.path.splitext(cleaned)[0]
        formatted = re.sub(r"[-_]+", " ", name_part).strip().title()

        words = [
            word for word in formatted.split()
            if word.lower() not in {
                "uploaded", "csv", "file", "data", "temp"
            }
        ]

        clean_name = " ".join(words)

        if not clean_name:
            return "Unknown Company"

        if clean_name.lower() in {
            "sample", "test", "demo", "bom", "assembly bom", "assembly"
        }:
            return "Apex Precision Components Pvt Ltd"

        if not any(
            suffix in clean_name.lower()
            for suffix in ("ltd", "inc", "corp", "pvt", "llc")
        ):
            return f"{clean_name} Enterprise"

        return clean_name

    @staticmethod
    def _clean_text(value: Any) -> str:
        """Convert a non-empty cell into clean text."""
        if value is None or pd.isna(value):
            return ""
        return str(value).strip()

    @staticmethod
    def _normalize_column(column: Any) -> str:
        """Normalize a column name for flexible matching."""
        return re.sub(r"\s+", " ", str(column).strip().lower())

    def extract_bom_details(self, file_path: str) -> Dict[str, Any]:
        """Parse a BOM file or raise an explicit error."""
        logger.info("Parsing BOM file: %s", file_path)

        if not file_path or not os.path.isfile(file_path):
            raise FileNotFoundError(
                f"BOM file not found: {file_path!r}. "
                "Upload a BOM or select an existing file."
            )

        extension = os.path.splitext(file_path)[1].lower()

        if extension not in {".csv", ".xlsx", ".xls"}:
            raise ValueError(
                f"Unsupported BOM format: {extension or 'no extension'}. "
                "Supported formats are CSV, XLSX, and XLS."
            )

        try:
            if extension == ".csv":
                df = pd.read_csv(file_path)
            else:
                df = pd.read_excel(file_path)
        except Exception as exc:
            logger.exception("Unable to read BOM file: %s", file_path)
            raise ValueError(
                f"Could not read BOM file '{os.path.basename(file_path)}': "
                f"{exc}"
            ) from exc

        if df.empty:
            raise ValueError("The BOM file contains no line items.")

        # Map normalized column names to their original column names.
        column_map = {
            self._normalize_column(column): column
            for column in df.columns
        }

        def find_column(field: str):
            for alias in self.COLUMN_ALIASES[field]:
                normalized = self._normalize_column(alias)
                if normalized in column_map:
                    return column_map[normalized]
            return None

        part_col = find_column("part_number")
        desc_col = find_column("description")
        qty_col = find_column("quantity")
        material_col = find_column("material_spec")
        price_col = find_column("target_price")

        # A usable BOM needs identifiable parts and quantities.
        missing_fields = []
        if part_col is None:
            missing_fields.append("part_number")
        if desc_col is None:
            missing_fields.append("description")
        if qty_col is None:
            missing_fields.append("quantity")

        if missing_fields:
            raise ValueError(
                "BOM is missing required columns: "
                + ", ".join(missing_fields)
                + ". Expected columns include part_number, description, "
                  "and quantity."
            )

        company_name = self.derive_company_name_from_filename(file_path)

        for normalized, original in column_map.items():
            if normalized in self.COMPANY_COLUMNS:
                values = df[original].dropna()
                if not values.empty:
                    supplied_name = str(values.iloc[0]).strip()
                    if supplied_name:
                        company_name = supplied_name
                break

        items: List[Dict[str, Any]] = []

        for index, row in df.iterrows():
            part_number = self._clean_text(row[part_col])
            description = self._clean_text(row[desc_col])
            quantity_value = row[qty_col]

            # Skip completely blank rows, but do not invent line items.
            if (
                not part_number
                and not description
                and (
                    quantity_value is None
                    or pd.isna(quantity_value)
                    or not str(quantity_value).strip()
                )
            ):
                continue

            if not part_number:
                raise ValueError(
                    f"BOM row {index + 2} has no part number."
                )

            if not description:
                raise ValueError(
                    f"BOM row {index + 2} has no description."
                )

            try:
                quantity_number = float(quantity_value)
                if (
                    not quantity_number.is_integer()
                    or quantity_number <= 0
                ):
                    raise ValueError
                quantity = int(quantity_number)
            except (TypeError, ValueError):
                raise ValueError(
                    f"BOM row {index + 2} has an invalid quantity: "
                    f"{quantity_value!r}. Use a positive whole number."
                )

            material_spec = (
                self._clean_text(row[material_col])
                if material_col is not None
                else ""
            )

            target_price = 0.0
            if price_col is not None:
                price_value = row[price_col]

                if price_value is not None and not pd.isna(price_value):
                    try:
                        target_price = float(price_value)
                    except (TypeError, ValueError):
                        raise ValueError(
                            f"BOM row {index + 2} has an invalid target "
                            f"price: {price_value!r}."
                        )

                    if target_price < 0:
                        raise ValueError(
                            f"BOM row {index + 2} has a negative target price."
                        )

            items.append({
                "part_number": part_number,
                "description": description,
                "quantity": quantity,
                "material_spec": material_spec,
                "target_price": round(target_price, 2),
            })

        if not items:
            raise ValueError(
                "No valid BOM line items were found in the uploaded file."
            )

        logger.info(
            "Successfully parsed %d BOM line items from %s",
            len(items),
            file_path,
        )

        return {
            "company_name": company_name,
            "line_items": items,
        }

    def extract_bom(self, file_path: str) -> List[Dict[str, Any]]:
        """Return parsed BOM line items."""
        details = self.extract_bom_details(file_path)
        return details["line_items"]


doc_parser_mcp_server = DocParserMCPServer()
