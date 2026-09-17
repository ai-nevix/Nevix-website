"""Generate Strapi v5 content-type scaffolding.

Strapi requires one directory per content type with a fixed layout — schema, controller, route and
service. The controller/route/service files are entirely mechanical, so they are generated here
rather than written out by hand for every type.

Run from apps/cms:   python scripts/generate-content-types.py

Content model: specification §7.1, §15, §16 and instruction §29.
"""

from __future__ import annotations

import json
import os
import textwrap

BASE = "src/api"

SEO = {"type": "component", "repeatable": False, "component": "shared.seo"}

COLLECTION_TYPES: dict[str, dict] = {
    "service-category": {
        "singular": "service-category",
        "plural": "service-categories",
        "display": "Service Category",
        "description": "One of the six VASTRIX service categories (specification §5.1).",
        "attributes": {
            "name": {"type": "string", "required": True, "unique": True, "maxLength": 120},
            "slug": {"type": "uid", "targetField": "name", "required": True},
            "navLabel": {"type": "string", "maxLength": 60},
            "positioning": {"type": "text", "required": True},
            "oneLineValue": {"type": "string", "maxLength": 200},
            "cardCta": {"type": "string", "maxLength": 40},
            "description": {"type": "text", "required": True},
            "heroTitle": {"type": "string", "required": True, "maxLength": 200},
            "heroDescription": {"type": "text", "required": True},
            "icon": {"type": "string", "maxLength": 40},
            "isCorePillar": {"type": "boolean", "default": False},
            "order": {"type": "integer", "default": 0},
            "services": {
                "type": "relation",
                "relation": "oneToMany",
                "target": "api::service.service",
                "mappedBy": "category",
            },
            "seo": SEO,
        },
    },
    "service": {
        "singular": "service",
        "plural": "services",
        "display": "Service",
        "description": "A VASTRIX service (specification §7.1).",
        "attributes": {
            "name": {"type": "string", "required": True, "maxLength": 160},
            "slug": {"type": "uid", "targetField": "name", "required": True},
            "category": {
                "type": "relation",
                "relation": "manyToOne",
                "target": "api::service-category.service-category",
                "inversedBy": "services",
            },
            "shortDescription": {"type": "text", "required": True},
            "heroTitle": {"type": "string", "required": True, "maxLength": 200},
            "heroDescription": {"type": "text", "required": True},
            "problemStatement": {"type": "richtext", "required": True},
            "whatWeDo": {"type": "richtext", "required": True},
            "capabilities": {"type": "json"},
            "useCases": {"type": "json"},
            "technologyApproach": {"type": "richtext"},
            "technologies": {"type": "json"},
            "outcomes": {"type": "json"},
            "faq": {"type": "component", "repeatable": True, "component": "shared.faq-item"},
            "caseStudies": {
                "type": "relation",
                "relation": "manyToMany",
                "target": "api::case-study.case-study",
                "inversedBy": "services",
            },
            "solutions": {
                "type": "relation",
                "relation": "manyToMany",
                "target": "api::solution.solution",
                "inversedBy": "services",
            },
            "order": {"type": "integer", "default": 0},
            "seo": SEO,
        },
    },
    "solution": {
        "singular": "solution",
        "plural": "solutions",
        "display": "Solution",
        "description": "An outcome-oriented solution pattern (specification §8).",
        "attributes": {
            "name": {"type": "string", "required": True, "maxLength": 160},
            "slug": {"type": "uid", "targetField": "name", "required": True},
            "problem": {"type": "text", "required": True},
            "summary": {"type": "text", "required": True},
            "heroTitle": {"type": "string", "required": True, "maxLength": 200},
            "heroDescription": {"type": "text", "required": True},
            "workflow": {"type": "component", "repeatable": True, "component": "shared.step"},
            "technicalApproach": {"type": "json"},
            "illustrativeOutcomes": {"type": "json"},
            "services": {
                "type": "relation",
                "relation": "manyToMany",
                "target": "api::service.service",
                "mappedBy": "solutions",
            },
            "industries": {
                "type": "relation",
                "relation": "manyToMany",
                "target": "api::industry.industry",
                "inversedBy": "solutions",
            },
            "icon": {"type": "string", "maxLength": 40},
            "order": {"type": "integer", "default": 0},
            "seo": SEO,
        },
    },
    "industry": {
        "singular": "industry",
        "plural": "industries",
        "display": "Industry",
        "description": "Sector context. Never a claim of sector credentials (catalogue §8).",
        "attributes": {
            "name": {"type": "string", "required": True, "maxLength": 120},
            "slug": {"type": "uid", "targetField": "name", "required": True},
            "summary": {"type": "text", "required": True},
            "heroTitle": {"type": "string", "required": True, "maxLength": 200},
            "heroDescription": {"type": "text", "required": True},
            "context": {"type": "richtext", "required": True},
            "capabilityAreas": {
                "type": "component",
                "repeatable": True,
                "component": "shared.list-item",
            },
            "considerations": {"type": "json"},
            "solutions": {
                "type": "relation",
                "relation": "manyToMany",
                "target": "api::solution.solution",
                "mappedBy": "industries",
            },
            "icon": {"type": "string", "maxLength": 40},
            "order": {"type": "integer", "default": 0},
            "requiresComplianceNotice": {"type": "boolean", "default": False},
            "seo": SEO,
        },
    },
    "product": {
        "singular": "product",
        "plural": "products",
        "display": "Product",
        "description": "A VASTRIX product. Status must reflect reality (specification §9.1).",
        "attributes": {
            "name": {"type": "string", "required": True, "maxLength": 120},
            "slug": {"type": "uid", "targetField": "name", "required": True},
            "tagline": {"type": "string", "maxLength": 200},
            "status": {
                "type": "enumeration",
                "enum": ["concept", "prototype", "beta", "live", "coming-soon"],
                "default": "concept",
                "required": True,
            },
            "summary": {"type": "text", "required": True},
            "heroTitle": {"type": "string", "required": True, "maxLength": 200},
            "heroDescription": {"type": "text", "required": True},
            "problem": {"type": "richtext", "required": True},
            "plannedCapabilities": {"type": "json"},
            "services": {
                "type": "relation",
                "relation": "manyToMany",
                "target": "api::service.service",
            },
            "icon": {"type": "string", "maxLength": 40},
            "isPlaceholder": {"type": "boolean", "default": True},
            "order": {"type": "integer", "default": 0},
            "seo": SEO,
        },
    },
    "case-study": {
        "singular": "case-study",
        "plural": "case-studies",
        "display": "Case Study",
        "description": (
            "Requires permission for client identity and evidence for every metric "
            "(catalogue §16, specification §31)."
        ),
        "attributes": {
            "title": {"type": "string", "required": True, "maxLength": 200},
            "slug": {"type": "uid", "targetField": "title", "required": True},
            "kind": {
                "type": "enumeration",
                "enum": ["demo", "approved"],
                "default": "demo",
                "required": True,
            },
            "client": {"type": "string", "maxLength": 160},
            "industry": {
                "type": "relation",
                "relation": "manyToOne",
                "target": "api::industry.industry",
            },
            "summary": {"type": "text", "required": True},
            "problem": {"type": "richtext", "required": True},
            "constraints": {"type": "json"},
            "approach": {"type": "richtext", "required": True},
            "architecture": {"type": "json"},
            "implementation": {"type": "json"},
            "outcomes": {"type": "component", "repeatable": True, "component": "shared.outcome"},
            "lessonsLearned": {"type": "json"},
            "technologies": {"type": "json"},
            "services": {
                "type": "relation",
                "relation": "manyToMany",
                "target": "api::service.service",
                "mappedBy": "caseStudies",
            },
            "coverImage": {"type": "media", "multiple": False, "allowedTypes": ["images"]},
            "order": {"type": "integer", "default": 0},
            "seo": SEO,
        },
    },
    "insight": {
        "singular": "insight",
        "plural": "insights",
        "display": "Insight",
        "description": "Editorial article (specification §9.3, instruction §24).",
        "attributes": {
            "title": {"type": "string", "required": True, "maxLength": 200},
            "slug": {"type": "uid", "targetField": "title", "required": True},
            "excerpt": {"type": "text", "required": True, "maxLength": 400},
            "content": {"type": "richtext", "required": True},
            "author": {
                "type": "relation",
                "relation": "manyToOne",
                "target": "api::author.author",
                "inversedBy": "insights",
            },
            "category": {
                "type": "relation",
                "relation": "manyToOne",
                "target": "api::insight-category.insight-category",
                "inversedBy": "insights",
            },
            "tags": {"type": "json"},
            "featuredImage": {"type": "media", "multiple": False, "allowedTypes": ["images"]},
            "readingMinutes": {"type": "integer"},
            "featured": {"type": "boolean", "default": False},
            "seo": SEO,
        },
    },
    "insight-category": {
        "singular": "insight-category",
        "plural": "insight-categories",
        "display": "Insight Category",
        "description": "Topic grouping for insights.",
        "attributes": {
            "name": {"type": "string", "required": True, "unique": True, "maxLength": 80},
            "slug": {"type": "uid", "targetField": "name", "required": True},
            "description": {"type": "text"},
            "insights": {
                "type": "relation",
                "relation": "oneToMany",
                "target": "api::insight.insight",
                "mappedBy": "category",
            },
        },
    },
    "author": {
        "singular": "author",
        "plural": "authors",
        "display": "Author",
        "description": (
            "Insight author. Do not create a profile for a person who has not approved it "
            "(instruction §25)."
        ),
        "attributes": {
            "name": {"type": "string", "required": True, "maxLength": 120},
            "slug": {"type": "uid", "targetField": "name", "required": True},
            "role": {"type": "string", "maxLength": 120},
            "bio": {"type": "text"},
            "avatar": {"type": "media", "multiple": False, "allowedTypes": ["images"]},
            "insights": {
                "type": "relation",
                "relation": "oneToMany",
                "target": "api::insight.insight",
                "mappedBy": "author",
            },
        },
    },
    "faq": {
        "singular": "faq",
        "plural": "faqs",
        "display": "FAQ",
        "description": "Reusable question and answer.",
        "attributes": {
            "question": {"type": "string", "required": True, "maxLength": 300},
            "answer": {"type": "text", "required": True},
            "category": {"type": "string", "maxLength": 80},
            "order": {"type": "integer", "default": 0},
        },
    },
}

SINGLE_TYPES: dict[str, dict] = {
    "site-setting": {
        "singular": "site-setting",
        "plural": "site-settings",
        "display": "Site Settings",
        "description": "Global site configuration (specification §16).",
        "attributes": {
            "companyName": {"type": "string", "required": True, "default": "VASTRIX"},
            "tagline": {"type": "string", "default": "Explore. Automate. Evolve."},
            "positioning": {
                "type": "string",
                "default": "Intelligent Technology for a Smarter Tomorrow.",
            },
            "contactEmail": {"type": "email", "required": True},
            "phone": {"type": "string", "maxLength": 40},
            "address": {"type": "text"},
            "legalEntity": {"type": "text"},
            "social": {
                "type": "component",
                "repeatable": True,
                "component": "shared.social-link",
            },
            "defaultSeo": SEO,
        },
    },
}


def write(path: str, content: str) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="\n") as handle:
        handle.write(content)


def build(name: str, spec: dict, kind: str) -> None:
    api_dir = f"{BASE}/{name}"

    schema = {
        "kind": kind,
        "collectionName": spec["plural"].replace("-", "_"),
        "info": {
            "singularName": spec["singular"],
            "pluralName": spec["plural"],
            "displayName": spec["display"],
            "description": spec["description"],
        },
        "options": {"draftAndPublish": True},
        "pluginOptions": {},
        "attributes": spec["attributes"],
    }

    write(
        f"{api_dir}/content-types/{name}/schema.json",
        json.dumps(schema, indent=2, ensure_ascii=False) + "\n",
    )

    write(
        f"{api_dir}/controllers/{name}.js",
        textwrap.dedent(
            f"""\
            /**
             * {spec["display"]} controller.
             *
             * The generated core controller is sufficient: the frontend only reads content, and
             * every write goes through the Strapi admin panel.
             */
            'use strict';

            const {{ createCoreController }} = require('@strapi/strapi').factories;

            module.exports = createCoreController('api::{name}.{name}');
            """
        ),
    )

    write(
        f"{api_dir}/routes/{name}.js",
        textwrap.dedent(
            f"""\
            /**
             * {spec["display"]} routes.
             *
             * Public read access is granted explicitly in the Strapi admin under
             * Settings -> Roles -> Public, and through a READ-ONLY API token.
             * See docs/architecture/cms.md.
             */
            'use strict';

            const {{ createCoreRouter }} = require('@strapi/strapi').factories;

            module.exports = createCoreRouter('api::{name}.{name}');
            """
        ),
    )

    write(
        f"{api_dir}/services/{name}.js",
        textwrap.dedent(
            f"""\
            /**
             * {spec["display"]} service.
             */
            'use strict';

            const {{ createCoreService }} = require('@strapi/strapi').factories;

            module.exports = createCoreService('api::{name}.{name}');
            """
        ),
    )


def main() -> None:
    for name, spec in COLLECTION_TYPES.items():
        build(name, spec, "collectionType")
    for name, spec in SINGLE_TYPES.items():
        build(name, spec, "singleType")

    total = len(COLLECTION_TYPES) + len(SINGLE_TYPES)
    print(f"Generated {total} content types under {BASE}/")


if __name__ == "__main__":
    main()
