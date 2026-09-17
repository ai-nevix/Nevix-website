/**
 * Product routes.
 *
 * Public read access is granted explicitly in the Strapi admin under
 * Settings -> Roles -> Public, and through a READ-ONLY API token.
 * See docs/architecture/cms.md.
 */
'use strict';

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::product.product');
