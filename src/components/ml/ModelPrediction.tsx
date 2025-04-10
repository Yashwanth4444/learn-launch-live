
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Sparkles, Loader2 } from "lucide-react";

interface ModelPredictionProps {
  modelType: string;
  features: string[];
  targetFeature: string;
}

const ModelPrediction = ({ modelType, features, targetFeature }: ModelPredictionProps) => {
  const [featureValues, setFeatureValues] = useState<Record<string, string>>({});
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const handleInputChange = (feature: string, value: string) => {
    setFeatureValues(prev => ({
      ...prev,
      [feature]: value
    }));
  };
  
  const handlePredict = () => {
    // Validate inputs
    const missingFeatures = features.filter(f => !featureValues[f] || featureValues[f].trim() === "");
    
    if (missingFeatures.length > 0) {
      toast({
        title: "Missing values",
        description: `Please provide values for: ${missingFeatures.join(", ")}`,
        variant: "destructive",
      });
      return;
    }
    
    // Validate numeric inputs
    const invalidFeatures = features.filter(f => {
      if (!isNaN(Number(featureValues[f]))) return false;
      try {
        // Check if it's a valid JSON array
        const parsed = JSON.parse(featureValues[f]);
        return !Array.isArray(parsed);
      } catch {
        return true;
      }
    });
    
    if (invalidFeatures.length > 0) {
      toast({
        title: "Invalid values",
        description: `Please provide valid numeric values or arrays for: ${invalidFeatures.join(", ")}`,
        variant: "destructive",
      });
      return;
    }
    
    // Make prediction
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (modelType === "classification") {
        const result = Math.random() > 0.5 ? "Positive" : "Negative";
        const confidence = Math.random() * 30 + 70; // 70-100%
        setPrediction({
          result,
          confidence: confidence.toFixed(2),
          probabilities: {
            "Positive": result === "Positive" ? confidence / 100 : 1 - (confidence / 100),
            "Negative": result === "Negative" ? confidence / 100 : 1 - (confidence / 100),
          }
        });
      } else {
        // Regression prediction
        const baseValue = Math.random() * 100;
        setPrediction({
          result: baseValue.toFixed(2),
          confidence: (Math.random() * 20 + 80).toFixed(2),
          error: (Math.random() * 5).toFixed(2),
          range: [
            (baseValue - Math.random() * 10).toFixed(2),
            (baseValue + Math.random() * 10).toFixed(2)
          ]
        });
      }
      setLoading(false);
      
      toast({
        title: "Prediction complete",
        description: "Model has generated a prediction based on the input values",
      });
    }, 1500);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Make Predictions</CardTitle>
        <CardDescription>
          Test your trained model with new data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {features.map(feature => (
            <div key={feature} className="grid gap-2">
              <Label htmlFor={`feature-${feature}`}>{feature}</Label>
              <Input
                id={`feature-${feature}`}
                value={featureValues[feature] || ""}
                onChange={(e) => handleInputChange(feature, e.target.value)}
                placeholder={`Enter value for ${feature}`}
                disabled={loading}
              />
            </div>
          ))}
          
          {prediction && (
            <Card className="mt-4 bg-muted/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Prediction Result</CardTitle>
                <CardDescription>
                  Predicted {targetFeature}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {modelType === "classification" ? (
                    <>
                      <div>
                        <div className="text-sm text-muted-foreground">Predicted Class</div>
                        <div className="text-3xl font-bold text-primary">{prediction.result}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Confidence</div>
                        <div className="text-xl font-semibold">{prediction.confidence}%</div>
                      </div>
                      <div className="bg-background p-3 rounded-md border mt-4">
                        <p className="text-sm font-medium mb-2">Class Probabilities</p>
                        {Object.entries(prediction.probabilities).map(([className, prob]: [string, any]) => (
                          <div key={className} className="mb-2">
                            <div className="flex justify-between text-sm">
                              <span>{className}</span>
                              <span>{(prob * 100).toFixed(1)}%</span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden mt-1">
                              <div 
                                className={`h-full ${className === prediction.result ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                                style={{ width: `${prob * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <div className="text-sm text-muted-foreground">Predicted Value</div>
                        <div className="text-3xl font-bold text-primary">{prediction.result}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Confidence</div>
                        <div className="text-xl font-semibold">{prediction.confidence}%</div>
                      </div>
                      <div className="bg-background p-3 rounded-md border mt-4">
                        <p className="text-sm font-medium mb-2">Prediction Range</p>
                        <p className="text-sm">
                          The predicted value is likely to be between <span className="font-medium">{prediction.range[0]}</span> and <span className="font-medium">{prediction.range[1]}</span> with a margin of error of ±{prediction.error}.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handlePredict}
          disabled={loading || features.length === 0}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Prediction...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Make Prediction
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ModelPrediction;
