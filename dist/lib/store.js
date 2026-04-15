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
exports.ensureSkillManagerDir = ensureSkillManagerDir;
exports.loadIndex = loadIndex;
exports.saveIndex = saveIndex;
exports.loadOperations = loadOperations;
exports.saveOperations = saveOperations;
exports.addOperation = addOperation;
const fs = __importStar(require("fs"));
const paths_1 = require("./paths");
function ensureSkillManagerDir() {
    if (!fs.existsSync(paths_1.SKILL_MANAGER_DIR)) {
        fs.mkdirSync(paths_1.SKILL_MANAGER_DIR, { recursive: true });
    }
}
function loadIndex() {
    ensureSkillManagerDir();
    if (!fs.existsSync(paths_1.INDEX_FILE)) {
        return { version: '1.0', lastScan: '', skills: [] };
    }
    try {
        const content = fs.readFileSync(paths_1.INDEX_FILE, 'utf-8');
        return JSON.parse(content);
    }
    catch {
        return { version: '1.0', lastScan: '', skills: [] };
    }
}
function saveIndex(index) {
    ensureSkillManagerDir();
    fs.writeFileSync(paths_1.INDEX_FILE, JSON.stringify(index, null, 2));
}
function loadOperations() {
    ensureSkillManagerDir();
    if (!fs.existsSync(paths_1.OPERATIONS_FILE)) {
        return [];
    }
    try {
        const content = fs.readFileSync(paths_1.OPERATIONS_FILE, 'utf-8');
        return JSON.parse(content);
    }
    catch {
        return [];
    }
}
function saveOperations(operations) {
    ensureSkillManagerDir();
    fs.writeFileSync(paths_1.OPERATIONS_FILE, JSON.stringify(operations, null, 2));
}
function addOperation(op) {
    const operations = loadOperations();
    operations.unshift(op); // Add to beginning
    // Keep only last 100 operations
    if (operations.length > 100) {
        operations.pop();
    }
    saveOperations(operations);
}
//# sourceMappingURL=store.js.map