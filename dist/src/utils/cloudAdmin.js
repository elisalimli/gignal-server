"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const gignal_92ee9_firebase_adminsdk_wlxgo_17f4e5879d_jsongignal_92ee9_firebase_adminsdk_wlxgo_17f4e5879d_json_1 = __importDefault(require("../../gignal-92ee9-firebase-adminsdk-wlxgo-17f4e5879d.jsongignal-92ee9-firebase-adminsdk-wlxgo-17f4e5879d.json"));
firebase_admin_1.default.initializeApp({ credential: firebase_admin_1.default.credential.cert(gignal_92ee9_firebase_adminsdk_wlxgo_17f4e5879d_jsongignal_92ee9_firebase_adminsdk_wlxgo_17f4e5879d_json_1.default) });
exports.default = firebase_admin_1.default;
//# sourceMappingURL=cloudAdmin.js.map