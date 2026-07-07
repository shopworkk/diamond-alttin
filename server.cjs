var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_vite = require("vite");
var import_app = require("firebase/app");
var import_firestore = require("firebase/firestore");
var configPath = import_path.default.join(process.cwd(), "firebase-applet-config.json");
var firebaseConfig = {};
try {
  firebaseConfig = JSON.parse(import_fs.default.readFileSync(configPath, "utf-8"));
} catch (err) {
  console.error("Failed to load firebase-applet-config.json:", err);
}
var firebaseApp = (0, import_app.initializeApp)({
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId
});
var db = (0, import_firestore.getFirestore)(firebaseApp, firebaseConfig.firestoreDatabaseId || "ai-studio-7a5f04d9-280b-4053-89bf-50d1530d6608");
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json({ limit: "10mb" }));
  app.get("/api/db/:collectionName", async (req, res) => {
    try {
      const { collectionName } = req.params;
      const colRef = (0, import_firestore.collection)(db, collectionName);
      const snapshot = await (0, import_firestore.getDocs)(colRef);
      const items = snapshot.docs.map((docSnapshot) => ({
        id: docSnapshot.id,
        ...docSnapshot.data()
      }));
      res.json(items);
    } catch (error) {
      console.error(`Error fetching collection ${req.params.collectionName}:`, error);
      res.status(500).json({ error: error.message || String(error) });
    }
  });
  app.get("/api/db/:collectionName/:id", async (req, res) => {
    try {
      const { collectionName, id } = req.params;
      const docRef = (0, import_firestore.doc)(db, collectionName, id);
      const docSnap = await (0, import_firestore.getDoc)(docRef);
      if (docSnap.exists()) {
        res.json({ id: docSnap.id, ...docSnap.data() });
      } else {
        res.status(404).json({ error: "Document not found" });
      }
    } catch (error) {
      console.error(`Error getting document ${req.params.id} from ${req.params.collectionName}:`, error);
      res.status(500).json({ error: error.message || String(error) });
    }
  });
  app.post("/api/db/:collectionName", async (req, res) => {
    try {
      const { collectionName } = req.params;
      const colRef = (0, import_firestore.collection)(db, collectionName);
      const docRef = await (0, import_firestore.addDoc)(colRef, req.body);
      res.json({ id: docRef.id });
    } catch (error) {
      console.error(`Error adding document to collection ${req.params.collectionName}:`, error);
      res.status(500).json({ error: error.message || String(error) });
    }
  });
  app.put("/api/db/:collectionName/:id", async (req, res) => {
    try {
      const { collectionName, id } = req.params;
      const docRef = (0, import_firestore.doc)(db, collectionName, id);
      await (0, import_firestore.updateDoc)(docRef, req.body);
      res.json({ id });
    } catch (error) {
      console.error(`Error updating document ${req.params.id} in collection ${req.params.collectionName}:`, error);
      res.status(500).json({ error: error.message || String(error) });
    }
  });
  app.delete("/api/db/:collectionName/:id", async (req, res) => {
    try {
      const { collectionName, id } = req.params;
      const docRef = (0, import_firestore.doc)(db, collectionName, id);
      await (0, import_firestore.deleteDoc)(docRef);
      res.json({ id });
    } catch (error) {
      console.error(`Error deleting document ${req.params.id} from collection ${req.params.collectionName}:`, error);
      res.status(500).json({ error: error.message || String(error) });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Full-stack backend proxy running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
