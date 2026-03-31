import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Upload, Eraser, Download } from "lucide-react";

export default function DesignTools() {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const removeBgMutation = trpc.design.removeBackground.useMutation({
    onSuccess: (data) => {
      if (data && data.url) {
        setProcessedUrl(data.url);
        toast.success("Background removed successfully!");
      } else {
        console.error("Invalid response from AI:", data);
        toast.error("AI returned an invalid response. Please try again.");
      }
    },
    onError: (error) => {
      console.error("AI Error:", error);
      toast.error(`AI Error: ${error.message || "Unknown error occurred"}`);
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveBackground = () => {
    if (!imageUrl) {
      toast.error("Please provide an image first");
      return;
    }
    removeBgMutation.mutate({ image: imageUrl });
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Design Tools</h1>
        <p className="text-muted-foreground">
          Enhance your landscape photos with AI-powered design tools.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eraser className="w-5 h-5" />
              Background Remover
            </CardTitle>
            <CardDescription>
              Upload an image to automatically remove its background using WaveSpeed AI.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="picture">Upload Image</Label>
              <div className="flex gap-2">
                <Input
                  id="picture"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isUploading || removeBgMutation.isPending}
                />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {imageUrl && (
                <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
                  <img
                    src={imageUrl}
                    alt="Original"
                    className="object-contain w-full h-full"
                  />
                </div>
              )}

              <Button
                onClick={handleRemoveBackground}
                disabled={!imageUrl || removeBgMutation.isPending}
                className="w-full"
              >
                {removeBgMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Eraser className="mr-2 h-4 w-4" />
                    Remove Background
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Result
            </CardTitle>
            <CardDescription>
              Your processed image will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed rounded-lg bg-muted/50">
            {processedUrl ? (
              <div className="space-y-4 w-full">
                <div className="relative aspect-video rounded-lg overflow-hidden border bg-[url('https://www.transparenttextures.com/patterns/checkerboard.png')] bg-repeat">
                  <img
                    src={processedUrl}
                    alt="Processed"
                    className="object-contain w-full h-full"
                  />
                </div>
                <Button asChild className="w-full" variant="outline">
                  <a href={processedUrl} download="no-background.png" target="_blank" rel="noreferrer">
                    <Download className="mr-2 h-4 w-4" />
                    Download PNG
                  </a>
                </Button>
              </div>
            ) : (
              <div className="text-center p-8 text-muted-foreground">
                <Eraser className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No image processed yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
