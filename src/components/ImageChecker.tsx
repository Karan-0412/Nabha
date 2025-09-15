import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Camera, Upload, X, Eye, AlertTriangle } from 'lucide-react';
import { alternativeAIService, ImageAnalysis } from '@/services/alternativeAIService';

interface ImageCheckerProps {
  onClose?: () => void;
}

const ImageChecker = ({ onClose }: ImageCheckerProps) => {
  const { t, i18n } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      setSelectedFile(file);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      // Convert image to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data:image/...;base64, prefix
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      const result = await alternativeAIService.analyzeImage(base64, description);
      setAnalysis(result);
    } catch (err) {
      setError('Failed to analyze image. Please try again.');
      console.error('Image analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setAnalysis(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800 border-green-200';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-primary" />
          AI Image Checker
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Upload a medical image for AI analysis. This tool can help identify visible health issues.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!analysis ? (
          <>
            {/* File Upload */}
            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                {imagePreview ? (
                  <div className="space-y-4">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-h-64 mx-auto rounded-lg shadow-sm"
                    />
                    <div className="flex gap-2 justify-center">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleRemoveImage}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Camera className="h-12 w-12 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Upload a medical image</p>
                      <p className="text-xs text-muted-foreground">
                        Supported formats: JPG, PNG, GIF (Max 10MB)
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </Button>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Description Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Additional context (optional):
                </label>
                <Input
                  placeholder="e.g., This is a skin rash that appeared 3 days ago..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={handleAnalyze} 
                  disabled={!selectedFile || isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Analyze Image
                    </>
                  )}
                </Button>
                {onClose && (
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {/* Image Preview with Analysis */}
            {imagePreview && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Analyzed Image:</h4>
                <img 
                  src={imagePreview} 
                  alt="Analyzed" 
                  className="max-h-48 mx-auto rounded-lg shadow-sm"
                />
              </div>
            )}

            {/* Analysis Results */}
            <div className="space-y-4">
              {/* Description */}
              <div>
                <h4 className="text-sm font-medium mb-2">AI Description:</h4>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                  {analysis.description}
                </p>
              </div>

              {/* Confidence Level */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Confidence:</span>
                <Badge className={getConfidenceColor(analysis.confidence)}>
                  {Math.round(analysis.confidence * 100)}%
                </Badge>
              </div>

              {/* Possible Conditions */}
              <div>
                <h4 className="text-sm font-medium mb-2">Possible Conditions:</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.possibleConditions.map((condition, index) => (
                    <Badge key={index} variant="outline">
                      {condition}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="text-sm font-medium mb-2">Recommendations:</h4>
                <ul className="space-y-1">
                  {analysis.recommendations.map((recommendation, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      {recommendation}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Important Notice */}
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> This AI analysis is for informational purposes only. 
                  Please consult with a healthcare professional for proper medical diagnosis and treatment.
                </AlertDescription>
              </Alert>

              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  onClick={() => {
                    setAnalysis(null);
                    handleRemoveImage();
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Analyze New Image
                </Button>
                {onClose && (
                  <Button onClick={onClose}>
                    Close
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
          <strong>Disclaimer:</strong> This AI image checker is for informational purposes only and should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider for any medical concerns.
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageChecker;
