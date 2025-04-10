
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Check, Info, Sparkles, PlayCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ModelTrainingProps {
  dataset: Record<string, any>[] | null;
  onTrainingComplete: (results: any) => void;
}

const ModelTraining = ({ dataset, onTrainingComplete }: ModelTrainingProps) => {
  const [selectedModel, setSelectedModel] = useState("classification");
  const [trainTestSplit, setTrainTestSplit] = useState(80);
  const [epochs, setEpochs] = useState(10);
  const [learningRate, setLearningRate] = useState(0.01);
  const [targetFeature, setTargetFeature] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [enabledFeatures, setEnabledFeatures] = useState<Record<string, boolean>>({});
  const [useAdvancedSettings, setUseAdvancedSettings] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [modelValidated, setModelValidated] = useState(false);
  
  const { toast } = useToast();

  // Extract features from the dataset
  const features = dataset && dataset.length > 0 ? Object.keys(dataset[0]) : [];

  // Toggle feature selection
  const toggleFeature = (feature: string) => {
    setEnabledFeatures(prev => ({
      ...prev,
      [feature]: !prev[feature]
    }));
    
    if (enabledFeatures[feature]) {
      setSelectedFeatures(selectedFeatures.filter(f => f !== feature));
    } else {
      setSelectedFeatures([...selectedFeatures, feature]);
    }
  };
  
  // Validate model configuration
  const validateModel = () => {
    if (!targetFeature) {
      toast({
        title: "Validation Error",
        description: "Please select a target feature",
        variant: "destructive",
      });
      return false;
    }
    
    if (selectedFeatures.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one input feature",
        variant: "destructive",
      });
      return false;
    }
    
    if (selectedFeatures.includes(targetFeature)) {
      toast({
        title: "Validation Warning",
        description: "Target feature should not be included in input features",
        variant: "destructive",
      });
      return false;
    }
    
    // Check if target feature is numerical or categorical
    if (dataset && dataset.length > 0) {
      const sampleValue = dataset[0][targetFeature];
      if (selectedModel === "regression" && typeof sampleValue !== "number") {
        toast({
          title: "Model Mismatch",
          description: "Selected regression model but target feature is not numerical",
          variant: "destructive",
        });
        return false;
      }
    }
    
    setModelValidated(true);
    toast({
      title: "Model configuration valid",
      description: "Ready to train the model",
    });
    return true;
  };
  
  // Start model training
  const startTraining = async () => {
    if (!validateModel()) return;
    
    setIsTraining(true);
    setTrainingProgress(0);
    
    // Simulate training progress
    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 200);
    
    // Simulate model training completion
    setTimeout(() => {
      clearInterval(interval);
      setTrainingProgress(100);
      setIsTraining(false);
      
      const trainingResults = {
        model: selectedModel,
        metrics: {
          accuracy: selectedModel === "classification" ? 87.5 : undefined,
          f1Score: selectedModel === "classification" ? 0.86 : undefined,
          precision: selectedModel === "classification" ? 0.89 : undefined,
          recall: selectedModel === "classification" ? 0.84 : undefined,
          mse: selectedModel === "regression" ? 0.023 : undefined,
          rmse: selectedModel === "regression" ? 0.152 : undefined,
          r2: selectedModel === "regression" ? 0.912 : undefined,
          mae: selectedModel === "regression" ? 0.138 : undefined,
        },
        featureImportance: selectedFeatures.reduce((acc, feature, index) => {
          acc[feature] = Math.random().toFixed(4);
          return acc;
        }, {} as Record<string, string>),
        confusionMatrix: selectedModel === "classification" ? [
          [120, 15],
          [18, 147]
        ] : undefined,
        trainTime: `${(Math.random() * 10 + 5).toFixed(2)}s`,
        trainTestSplit,
        hyperparameters: {
          epochs,
          learningRate,
          optimizer: "adam",
        }
      };
      
      onTrainingComplete(trainingResults);
      
      toast({
        title: "Training complete",
        description: `Model trained successfully with ${selectedModel === "classification" ? "87.5% accuracy" : "0.912 R² score"}`,
      });
    }, 5000);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Train Machine Learning Model</CardTitle>
        <CardDescription>
          Configure and train a model using your dataset
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Settings</TabsTrigger>
            <TabsTrigger value="advanced" disabled={!useAdvancedSettings}>
              Advanced Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="model-type">Model Type</Label>
                <Select
                  value={selectedModel}
                  onValueChange={setSelectedModel}
                  disabled={isTraining}
                >
                  <SelectTrigger id="model-type">
                    <SelectValue placeholder="Select model type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="classification">Classification</SelectItem>
                    <SelectItem value="regression">Regression</SelectItem>
                    <SelectItem value="clustering">Clustering</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="target-feature">Target Feature</Label>
                <Select
                  value={targetFeature}
                  onValueChange={setTargetFeature}
                  disabled={isTraining || !dataset}
                >
                  <SelectTrigger id="target-feature">
                    <SelectValue placeholder="Select target feature" />
                  </SelectTrigger>
                  <SelectContent>
                    {features.map(feature => (
                      <SelectItem key={feature} value={feature}>
                        {feature}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  The feature you want your model to predict
                </p>
              </div>
              
              <div className="grid gap-2">
                <div className="flex justify-between items-center">
                  <Label>Input Features</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      const allEnabled = Object.keys(enabledFeatures).length === features.length &&
                        Object.values(enabledFeatures).every(v => v);
                      
                      const newState = !allEnabled;
                      const updatedFeatures = features.reduce((acc, feature) => {
                        if (feature !== targetFeature) {
                          acc[feature] = newState;
                        }
                        return acc;
                      }, {} as Record<string, boolean>);
                      
                      setEnabledFeatures(updatedFeatures);
                      setSelectedFeatures(
                        newState 
                          ? features.filter(f => f !== targetFeature)
                          : []
                      );
                    }}
                    disabled={isTraining || !dataset}
                  >
                    {Object.keys(enabledFeatures).length === features.length &&
                      Object.values(enabledFeatures).every(v => v)
                      ? "Deselect All"
                      : "Select All"}
                  </Button>
                </div>
                
                <div className="grid gap-2 max-h-48 overflow-y-auto border rounded-md p-2">
                  {features.map(feature => (
                    <div key={feature} className="flex items-center space-x-2">
                      <Switch
                        id={`feature-${feature}`}
                        checked={enabledFeatures[feature]}
                        onCheckedChange={() => toggleFeature(feature)}
                        disabled={isTraining || feature === targetFeature}
                      />
                      <Label
                        htmlFor={`feature-${feature}`}
                        className={feature === targetFeature ? "text-muted-foreground line-through" : ""}
                      >
                        {feature} 
                        {feature === targetFeature && " (target)"}
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Select the features you want to use for training
                </p>
              </div>
              
              <div className="grid gap-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="train-test-split">Train/Test Split: {trainTestSplit}%</Label>
                </div>
                <Slider
                  id="train-test-split"
                  value={[trainTestSplit]}
                  min={50}
                  max={90}
                  step={5}
                  onValueChange={([value]) => setTrainTestSplit(value)}
                  disabled={isTraining}
                />
                <p className="text-sm text-muted-foreground">
                  {trainTestSplit}% of data for training, {100 - trainTestSplit}% for testing
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="advanced-settings"
                  checked={useAdvancedSettings}
                  onCheckedChange={setUseAdvancedSettings}
                  disabled={isTraining}
                />
                <Label htmlFor="advanced-settings">Enable advanced settings</Label>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="epochs">Epochs</Label>
                <Input
                  id="epochs"
                  type="number"
                  value={epochs}
                  onChange={(e) => setEpochs(parseInt(e.target.value) || 1)}
                  min="1"
                  max="100"
                  disabled={isTraining}
                />
                <p className="text-sm text-muted-foreground">
                  Number of complete passes through the dataset
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="learning-rate">Learning Rate: {learningRate}</Label>
                <Slider
                  id="learning-rate"
                  value={[learningRate * 100]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={([value]) => setLearningRate(value / 100)}
                  disabled={isTraining}
                />
                <p className="text-sm text-muted-foreground">
                  Controls how quickly the model adapts to the problem
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="optimizer">Optimizer</Label>
                <Select defaultValue="adam" disabled={isTraining}>
                  <SelectTrigger id="optimizer">
                    <SelectValue placeholder="Select optimizer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adam">Adam</SelectItem>
                    <SelectItem value="sgd">SGD</SelectItem>
                    <SelectItem value="rmsprop">RMSprop</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {isTraining && (
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Training in progress...</span>
              <span>{trainingProgress}%</span>
            </div>
            <Progress value={trainingProgress} />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={validateModel}
          disabled={isTraining || !dataset}
        >
          <Info className="mr-2 h-4 w-4" />
          Validate
        </Button>
        
        <Button
          onClick={startTraining}
          disabled={isTraining || !dataset}
        >
          {isTraining ? (
            <>Training...</>
          ) : modelValidated ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Train Model
            </>
          ) : (
            <>
              <PlayCircle className="mr-2 h-4 w-4" />
              Train Model
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ModelTraining;
