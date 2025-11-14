import { Storage, File } from "@google-cloud/storage";
import { Response } from "express";
import { randomUUID } from "crypto";
import {
  ObjectAclPolicy,
  ObjectPermission,
  canAccessObject,
  getObjectAclPolicy,
  setObjectAclPolicy,
} from "./objectAcl";

// Initialize Google Cloud Storage client with standard authentication
// Uses GOOGLE_APPLICATION_CREDENTIALS environment variable or application default credentials
export const objectStorageClient = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
});

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

// The object storage service is used to interact with the object storage service.
export class ObjectStorageService {
  constructor() {}

  // Gets the public object search paths.
  getPublicObjectSearchPaths(): Array<string> {
    const pathsStr = process.env.PUBLIC_OBJECT_SEARCH_PATHS || "";
    const paths = Array.from(
      new Set(
        pathsStr
          .split(",")
          .map((path) => path.trim())
          .filter((path) => path.length > 0)
      )
    );
    if (paths.length === 0) {
      throw new Error(
        "PUBLIC_OBJECT_SEARCH_PATHS not set. Set this environment variable " +
          "with comma-separated GCS paths (e.g., gs://bucket-name/public)"
      );
    }
    return paths;
  }

  // Gets the private object directory.
  getPrivateObjectDir(): string {
    const dir = process.env.PRIVATE_OBJECT_DIR || "";
    if (!dir) {
      throw new Error(
        "PRIVATE_OBJECT_DIR not set. Set this environment variable " +
          "with a GCS path (e.g., gs://bucket-name/private)"
      );
    }
    return dir;
  }

  // Search for a public object from the search paths.
  async searchPublicObject(filePath: string): Promise<File | null> {
    for (const searchPath of this.getPublicObjectSearchPaths()) {
      const fullPath = `${searchPath}/${filePath}`;
      const file = await this.getObjectEntityFileFromGsPath(fullPath);
      const [exists] = await file.exists();
      if (exists) {
        return file;
      }
    }
    return null;
  }

  // Gets a private object file.
  async getPrivateObject(filePath: string): Promise<File> {
    const privateDir = this.getPrivateObjectDir();
    const fullPath = `${privateDir}/${filePath}`;
    return await this.getObjectEntityFileFromGsPath(fullPath);
  }

  // Converts a gs:// path to a File object
  async getObjectEntityFileFromGsPath(gsPath: string): Promise<File> {
    // Remove gs:// prefix if present
    const path = gsPath.replace(/^gs:\/\//, "");
    const parts = path.split("/");
    const bucketName = parts[0];
    const filePath = parts.slice(1).join("/");

    const bucket = objectStorageClient.bucket(bucketName);
    return bucket.file(filePath);
  }

  // Gets the object entity file from path
  async getObjectEntityFile(path: string): Promise<File> {
    // Remove leading /objects/ if present
    const cleanPath = path.replace(/^\/objects\//, "");

    // First try public search paths
    const publicFile = await this.searchPublicObject(cleanPath);
    if (publicFile) {
      return publicFile;
    }

    // Then try private directory
    try {
      const privateFile = await this.getPrivateObject(cleanPath);
      const [exists] = await privateFile.exists();
      if (exists) {
        return privateFile;
      }
    } catch (error) {
      // File not found in private either
    }

    throw new ObjectNotFoundError();
  }

  // Normalizes an object entity path
  normalizeObjectEntityPath(path: string): string {
    // Handle both full gs:// URLs and relative paths
    if (path.startsWith("gs://")) {
      return path;
    }
    if (path.startsWith("/objects/")) {
      return path.replace("/objects/", "");
    }
    if (path.startsWith("http://") || path.startsWith("https://")) {
      // Extract path from URL
      const url = new URL(path);
      return url.pathname.replace(/^\/objects\//, "");
    }
    return path;
  }

  // Gets a presigned upload URL for uploading objects
  async getObjectEntityUploadURL(): Promise<string> {
    const privateDir = this.getPrivateObjectDir();
    const fileName = `${randomUUID()}`;
    const fullPath = `${privateDir}/${fileName}`;

    const file = await this.getObjectEntityFileFromGsPath(fullPath);

    // Generate signed URL for upload (valid for 15 minutes)
    const [url] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType: "application/octet-stream",
    });

    return url;
  }

  // Downloads an object to the response
  async downloadObject(file: File, res: Response): Promise<void> {
    const [metadata] = await file.getMetadata();
    const contentType = metadata.contentType || "application/octet-stream";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=31536000"); // Cache for 1 year

    const stream = file.createReadStream();
    stream.pipe(res);
  }

  // Checks if the user can access the object
  async canAccessObjectEntity(options: {
    objectFile: File;
    userId?: string;
  }): Promise<boolean> {
    try {
      const policy = await getObjectAclPolicy(options.objectFile);
      if (!policy) {
        // No policy set, check if file is in public search paths
        const filePath = `gs://${options.objectFile.bucket.name}/${options.objectFile.name}`;
        const publicPaths = this.getPublicObjectSearchPaths();
        return publicPaths.some((path) => filePath.startsWith(path));
      }
      return canAccessObject(policy, options.userId);
    } catch (error) {
      console.error("Error checking access:", error);
      return false;
    }
  }

  // Sets the object ACL policy and returns the public URL
  async trySetObjectEntityAclPolicy(
    path: string,
    policy: ObjectAclPolicy
  ): Promise<string> {
    const normalizedPath = this.normalizeObjectEntityPath(path);
    const file = await this.getObjectEntityFile(normalizedPath);

    // Set the ACL policy
    await setObjectAclPolicy(file, policy);

    // If visibility is public, make the file publicly accessible
    if (policy.visibility === "public") {
      await file.makePublic();
    }

    // Return a public URL path
    return `/objects/${file.bucket.name}/${file.name}`;
  }
}
