
import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import ModelTraining from "@/components/ml/ModelTraining";
import ModelResults from "@/components/ml/ModelResults";
import ModelPrediction from "@/components/ml/ModelPrediction";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Upload, LineChart } from "lucide-react";

const sampleDataset = Array.from({ length: 100 }).map((_, i) => ({
  id: i + 1,
  age: Math.floor(Math.random() * 60) + 20,
  income: Math.floor(Math.random() * 100000) + 20000,
  education: ["High School", "Bachelor's", "Master's", "PhD"][Math.floor(Math.random() * 4)],
  occupation: ["Engineer", "Teacher", "Doctor", "Designer", "Manager"][Math.floor(Math.random() * 5)],
  creditScore: Math.floor(Math.random() * 500) + 300,
  hasLoan: Math.random() > 0.5,
  loanAmount: Math.random() > 0.5 ? Math.floor(Math.random() * 50000) + 1000 : 0,
  isDefaulter: Math.random() > 0.7
}));

const TrainPage = () => {
  const [dataset, setDataset] = useState<Record<string, any>[]>(sampleDataset);
  const [trainingResults, setTrainingResults] = useState<any>(null);
  const [activeModel, setActiveModel] = useState<string>("");
  const [targetFeature, setTargetFeature] = useState<string>("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  
  // Handle training completion
  const handleTrainingComplete = (results: any) => {
    setTrainingResults(results);
    setActiveModel(results.model);
    // Extract target feature and selected features from somewhere in the app state
    setTargetFeature("isDefaulter");
    setSelectedFeatures(["age", "income", "creditScore", "hasLoan", "loanAmount"]);
  };
  
  return (
    <PageLayout
      title="Model Training"
      description="Configure, train, and evaluate machine learning models"
    >
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Configure Training</h2>
          {dataset ? (
            <ModelTraining dataset={dataset} onTrainingComplete={handleTrainingComplete} />
          ) : (
            <div className="flex flex-col items-center justify-center p-12 border rounded-lg bg-muted/20">
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Dataset Available</h3>
              <p className="text-muted-foreground text-center mb-6">
                Please upload a dataset before training a model
              </p>
              <Button asChild>
                <Link to="/dataset">Upload Dataset</Link>
              </Button>
            </div>
          )}
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Model Results</h2>
          <ModelResults results={trainingResults} />
        </div>
      </div>
      
      {trainingResults && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Make Predictions</h2>
          <ModelPrediction 
            modelType={activeModel} 
            features={selectedFeatures} 
            targetFeature={targetFeature} 
          />
        </div>
      )}
    </PageLayout>
  );
};

export default TrainPage;
