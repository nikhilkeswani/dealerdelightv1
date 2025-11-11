import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, X, CheckCircle, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  onUploadComplete: (url: string) => void;
  onGetUploadUrl: () => Promise<string>;
  accept?: string;
  maxSize?: number; // in bytes
  className?: string;
  preview?: boolean;
}

export function FileUploader({
  onUploadComplete,
  onGetUploadUrl,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB default
  className,
  preview = true,
}: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    processFile(selectedFile);
  };

  const processFile = (selectedFile: File) => {
    // Check file size
    if (selectedFile.size > maxSize) {
      setError(`File size must be less than ${(maxSize / 1024 / 1024).toFixed(1)}MB`);
      return;
    }

    setFile(selectedFile);
    setError(null);
    setUploadComplete(false);

    // Create preview for images
    if (preview && selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const uploadFile = async (fileToUpload: File) => {
    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Get presigned URL from backend
      const uploadUrl = await onGetUploadUrl();

      // Upload file directly to storage
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setUploadProgress(progress);
        }
      });

      await new Promise((resolve, reject) => {
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.response);
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Upload failed"));
        });

        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", fileToUpload.type);
        xhr.send(fileToUpload);
      });

      setUploadProgress(100);
      
      // CRITICAL: Wait for completion handler to finish before marking as complete
      // This ensures backend save succeeds before showing success UI
      if (onUploadComplete) {
        await onUploadComplete(uploadUrl);
      }
      
      setUploadComplete(true);

      // Auto-reset after successful upload (after brief delay to show success)
      setTimeout(() => {
        handleRemove();
      }, 1500);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Upload failed");
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleUploadClick = async () => {
    if (!file) return;
    await uploadFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    setUploadComplete(false);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drag and Drop Zone */}
      {!file && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            data-testid="input-file-hidden"
          />
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative cursor-pointer rounded-lg border-2 border-dashed p-8 transition-all hover-elevate",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            )}
            data-testid="dropzone-upload"
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="rounded-full bg-primary/10 p-3">
                <ImageIcon className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="font-medium">
                  Drag and drop your logo here
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to browse files
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Maximum file size: {(maxSize / 1024 / 1024).toFixed(1)}MB
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Preview & Upload Controls */}
      {file && (
        <div className="space-y-4">
          {/* Preview */}
          {previewUrl && (
            <div className="relative">
              <div className="flex items-center justify-center p-6 bg-muted rounded-lg border-2 border-dashed border-muted-foreground/25">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-48 object-contain rounded"
                  data-testid="img-file-preview"
                />
              </div>
              {!uploading && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={handleRemove}
                  data-testid="button-remove-file"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}

          {/* File Info */}
          <div className="flex items-center justify-between gap-2 text-sm bg-muted px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2 min-w-0">
              <ImageIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-medium truncate">{file.name}</span>
              <span className="text-muted-foreground flex-shrink-0">
                ({(file.size / 1024).toFixed(1)} KB)
              </span>
            </div>
            {uploadComplete && (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" data-testid="icon-upload-complete" />
            )}
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} />
              <p className="text-sm text-muted-foreground text-center">
                Uploading... {uploadProgress.toFixed(0)}%
              </p>
            </div>
          )}

          {/* Upload Button */}
          {!uploading && !uploadComplete && (
            <Button
              onClick={handleUploadClick}
              className="w-full"
              size="lg"
              data-testid="button-upload"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Logo
            </Button>
          )}

          {/* Success Message */}
          {uploadComplete && (
            <div className="text-center py-2">
              <p className="text-sm font-medium text-green-600" data-testid="text-upload-success">
                Logo uploaded successfully!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
          <p className="text-sm text-destructive" data-testid="text-upload-error">
            {error}
          </p>
        </div>
      )}
    </div>
  );
}
