/**
 * Site Settings controller.
 *
 * The generated core controller is sufficient: the frontend only reads content, and
 * every write goes through the Strapi admin panel.
 */
'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::site-setting.site-setting');
