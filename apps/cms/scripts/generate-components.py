"""Generate the shared Strapi components used across content types.

Run from apps/cms:   python scripts/generate-components.py
"""

from __future__ import annotations

import json
import os

COMPONENTS: dict[str, dict] = {
    "seo": {
        "displayName": "SEO",
        "icon": "search",
        "description": "Per-entry SEO metadata (specification §23.2).",
        "attributes": {
            "title": {
                "type": "string",
                "maxLength": 70,
                "description": "Overrides the page title. Falls back to the entry name.",
            },
            "description": {
                "type": "text",
                "maxLength": 200,
                "description": "Meta description. Aim for 120-160 characters.",
            },
            "ogImage": {"type": "media", "multiple": False, "allowedTypes": ["images"]},
            "noIndex": {
                "type": "boolean",
                "default": False,
                "description": (
                    "Excludes the page from search indexing and from the sitemap. Set on demo "
                    "and placeholder content so unverified material cannot be presented as fact."
                ),
            },
            "keywords": {"type": "json"},
        },
    },
    "faq-item": {
        "displayName": "FAQ Item",
        "icon": "question",
        "description": "A question and its answer.",
        "attributes": {
            "question": {"type": "string", "required": True, "maxLength": 300},
            "answer": {"type": "text", "required": True},
        },
    },
    "step": {
        "displayName": "Step",
        "icon": "bulletList",
        "description": "One step in a workflow or process.",
        "attributes": {
            "title": {"type": "string", "required": True, "maxLength": 120},
            "description": {"type": "text", "required": True},
        },
    },
    "list-item": {
        "displayName": "List Item",
        "icon": "bulletList",
        "description": "A titled list entry with optional supporting text.",
        "attributes": {
            "title": {"type": "string", "required": True, "maxLength": 160},
            "description": {"type": "text"},
        },
    },
    "outcome": {
        "displayName": "Outcome",
        "icon": "chartBubble",
        "description": (
            "A case-study outcome. `evidence` is required before a case study may be marked "
            "'approved' — specification §31 requires evidence for any published metric."
        ),
        "attributes": {
            "label": {"type": "string", "required": True, "maxLength": 120},
            "value": {"type": "string", "required": True, "maxLength": 200},
            "evidence": {
                "type": "text",
                "description": "How the figure was established. Required for approved case studies.",
            },
        },
    },
    "social-link": {
        "displayName": "Social Link",
        "icon": "link",
        "description": "A social profile. Only add a URL that has been confirmed to exist.",
        "attributes": {
            "label": {"type": "string", "required": True, "maxLength": 40},
            "href": {"type": "string", "required": True, "maxLength": 300},
        },
    },
}


def main() -> None:
    directory = "src/components/shared"
    os.makedirs(directory, exist_ok=True)

    for name, spec in COMPONENTS.items():
        payload = {
            "collectionName": f"components_shared_{name.replace('-', '_')}s",
            "info": {
                "displayName": spec["displayName"],
                "icon": spec["icon"],
                "description": spec["description"],
            },
            "options": {},
            "attributes": spec["attributes"],
        }
        path = os.path.join(directory, f"{name}.json")
        with open(path, "w", encoding="utf-8", newline="\n") as handle:
            handle.write(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")

    print(f"Generated {len(COMPONENTS)} shared components under {directory}/")


if __name__ == "__main__":
    main()
