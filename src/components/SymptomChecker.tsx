import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Stethoscope, AlertTriangle, CheckCircle, Clock, User } from 'lucide-react';
import { alternativeAIService, SymptomAnalysis } from '@/services/alternativeAIService';

interface SymptomCheckerProps {
  onClose?: () => void;
}

const SymptomChecker = ({ onClose }: SymptomCheckerProps) => {
  const { t, i18n } = useTranslation();
  const [symptoms, setSymptoms] = useState('');
  const [analysis, setAnalysis] = useState<SymptomAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!symptoms.trim()) return;

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = await alternativeAIService.analyzeSymptoms(symptoms, i18n.language);
      setAnalysis(result);
    } catch (err) {
      setError('Failed to analyze symptoms. Please try again.');
      console.error('Symptom analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'immediate': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'within_24h': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'within_week': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'routine': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'immediate': return 'Seek immediate medical attention';
      case 'within_24h': return 'See a doctor within 24 hours';
      case 'within_week': return 'Schedule appointment within a week';
      case 'routine': return 'Routine check-up recommended';
      default: return 'Consult a healthcare provider';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-primary" />
          AI Symptom Checker
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Describe your symptoms and get AI-powered health insights. This is not a substitute for professional medical advice.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!analysis ? (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Describe your symptoms in detail:
              </label>
              <Textarea
                placeholder="e.g., I have been experiencing chest pain for 2 days, especially when I breathe deeply. The pain is sharp and located on the left side..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={4}
                className="resize-none"
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
                disabled={!symptoms.trim() || isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Stethoscope className="h-4 w-4 mr-2" />
                    Analyze Symptoms
                  </>
                )}
              </Button>
              {onClose && (
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {/* Urgency Alert */}
            <Alert className={analysis.urgency === 'immediate' ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}>
              <div className="flex items-center gap-2">
                {getUrgencyIcon(analysis.urgency)}
                <AlertDescription className="font-medium">
                  {getUrgencyText(analysis.urgency)}
                </AlertDescription>
              </div>
            </Alert>

            {/* Severity */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Severity:</span>
              <Badge className={getSeverityColor(analysis.severity)}>
                {analysis.severity.toUpperCase()}
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

            {/* Doctor Recommendation */}
            {analysis.shouldSeeDoctor && (
              <Alert>
                <User className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> Please consult with a healthcare professional for proper diagnosis and treatment.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2 pt-4 border-t">
              <Button 
                onClick={() => {
                  setAnalysis(null);
                  setSymptoms('');
                }}
                variant="outline"
                className="flex-1"
              >
                Check New Symptoms
              </Button>
              {onClose && (
                <Button onClick={onClose}>
                  Close
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
          <strong>Disclaimer:</strong> This AI symptom checker is for informational purposes only and should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider for any medical concerns.
        </div>
      </CardContent>
    </Card>
  );
};

export default SymptomChecker;
