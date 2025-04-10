
import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, X, FileText, Check } from "lucide-react";

const DatasetUploader = ({ onDatasetUploaded }: { onDatasetUploaded: (data: any[]) => void }) => {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length) {
      const droppedFile = files[0];
      if (droppedFile.type === "application/json" || droppedFile.name.endsWith(".csv")) {
        setFile(droppedFile);
      } else {
        toast({
          title: "Invalid file format",
          description: "Please upload a JSON or CSV file",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);

    const reader = new FileReader();
    
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setProgress(percentComplete);
      }
    };
    
    reader.onload = (event) => {
      try {
        let parsedData;
        
        if (file.type === "application/json") {
          parsedData = JSON.parse(event.target?.result as string);
        } else if (file.name.endsWith(".csv")) {
          // Simple CSV parsing logic - this would be more robust in a real app
          const csvContent = event.target?.result as string;
          const lines = csvContent.split("\n");
          const headers = lines[0].split(",");
          
          parsedData = lines.slice(1).map(line => {
            const values = line.split(",");
            const entry: Record<string, string> = {};
            headers.forEach((header, i) => {
              entry[header.trim()] = values[i]?.trim() || "";
            });
            return entry;
          });
        }
        
        // Simulate network delay
        setTimeout(() => {
          onDatasetUploaded(parsedData);
          setUploading(false);
          setProgress(100);
          toast({
            title: "Dataset uploaded successfully",
            description: `${file.name} is now ready for processing`,
          });
        }, 1500);
      } catch (error) {
        setUploading(false);
        toast({
          title: "Error parsing dataset",
          description: "Please ensure your file is a valid JSON or CSV format",
          variant: "destructive",
        });
      }
    };
    
    reader.readAsText(file);
  };

  const removeFile = () => {
    setFile(null);
    setProgress(0);
  };

  return (
    <Card className={`border-2 ${dragging ? "border-primary" : "border-dashed"} bg-muted/40`}>
      <CardContent className="p-6">
        <div 
          className={`rounded-lg p-8 text-center ${dragging ? "bg-primary/10" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {!file ? (
            <>
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Upload Dataset</h3>
              <p className="text-muted-foreground mb-4">
                Drag and drop your dataset file here, or click to browse
              </p>
              <Input
                type="file"
                className="hidden"
                id="dataset-upload"
                accept=".json,.csv"
                onChange={handleFileChange}
              />
              <Button asChild variant="outline">
                <label htmlFor="dataset-upload" className="cursor-pointer">
                  Browse Files
                </label>
              </Button>
              <div className="mt-4 text-sm text-muted-foreground">
                Supported formats: .json, .csv
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-background rounded-md border">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={removeFile}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {progress > 0 && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Uploading...</span>
                    <span>{progress}%</span>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                <Button 
                  onClick={handleUpload} 
                  disabled={uploading}
                  className="w-full sm:w-auto"
                >
                  {uploading ? (
                    <>Processing...</>
                  ) : progress === 100 ? (
                    <><Check className="h-4 w-4 mr-2" /> Uploaded</>
                  ) : (
                    <>Upload Dataset</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DatasetUploader;
