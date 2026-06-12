"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = config;
exports.build = build;
// This file contains code that we reuse between our tests.
const path = __importStar(require("node:path"));
const helper = require('fastify-cli/helper.js');
const AppPath = path.join(__dirname, '..', 'src', 'app.ts');
// Fill in this config with all the configurations
// needed for testing the application
function config() {
    return {
        skipOverride: true // Register our application with fastify-plugin
    };
}
// Automatically build and tear down our instance
async function build(t) {
    // you can set all the options supported by the fastify CLI command
    const argv = [AppPath];
    // fastify-plugin ensures that all decorators
    // are exposed for testing purposes, this is
    // different from the production setup
    const app = await helper.build(argv, config());
    // Tear down our app after we are done
    // eslint-disable-next-line no-void
    t.after(() => void app.close());
    return app;
}
