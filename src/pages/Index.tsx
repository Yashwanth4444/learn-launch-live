
import { Button } from "@/components/ui/button";
import PageLayout from "@/components/layout/PageLayout";
import ModelCard from "@/components/ui/model-card";
import { Link } from "react-router-dom";
import { Upload, BrainCircuit, AreaChart, Sparkles, PlusCircle, ChevronRight } from "lucide-react";

const Index = () => {
  const sampleModels = [
    {
      name: "Customer Churn Predictor",
      description: "Predict whether a customer will leave the service based on their usage patterns and demographic data.",
      type: "Classification",
      lastRun: "2 days ago",
      accuracy: 87.5
    },
    {
      name: "House Price Estimator",
      description: "Estimate property prices based on features such as location, size, number of rooms, and amenities.",
      type: "Regression",
      lastRun: "5 days ago",
      accuracy: 91.2
    },
    {
      name: "Product Recommendations",
      description: "Recommend products to users based on their purchase history and browsing behavior.",
      type: "Clustering",
      lastRun: "1 week ago",
      accuracy: 83.4
    }
  ];

  return (
    <PageLayout 
      title="Machine Learning Model Explorer" 
      description="Train, evaluate, and deploy machine learning models using your own data"
    >
      <div className="grid gap-8">
        <section className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-hero-pattern"></div>
          <div className="relative p-8 md:p-12 text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Transform Your Data Into Insights
            </h1>
            <p className="text-xl mb-8 max-w-2xl text-white/85">
              Upload your dataset, train powerful machine learning models, and generate predictions without writing any code.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                <Link to="/dataset">
                  <Upload className="mr-2 h-5 w-5" /> 
                  Upload Dataset
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Link to="/train">
                  <BrainCircuit className="mr-2 h-5 w-5" /> 
                  Train a Model
                </Link>
              </Button>
            </div>
          </div>
          <div className="absolute bottom-0 right-0 w-1/3 h-full hidden lg:block">
            <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-l from-primary/30 to-transparent" />
            <div className="absolute bottom-8 right-8 animate-float">
              <div className="p-3 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl">
                <AreaChart className="w-24 h-24 text-white" />
              </div>
            </div>
            <div className="absolute top-12 right-20 animate-float" style={{ animationDelay: "1s" }}>
              <div className="p-3 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl">
                <Sparkles className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>
        </section>
        
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Recent Models</h2>
            <Button variant="outline" asChild>
              <Link to="/train">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Model
              </Link>
            </Button>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleModels.map((model, index) => (
              <ModelCard
                key={index}
                name={model.name}
                description={model.description}
                type={model.type}
                lastRun={model.lastRun}
                accuracy={model.accuracy}
                onRun={() => {}}
                onView={() => {}}
              />
            ))}
          </div>
        </section>
        
        <section className="grid md:grid-cols-3 gap-6">
          <FeatureCard 
            icon={<Upload className="h-12 w-12 text-blue-500" />}
            title="Upload Dataset"
            description="Import your data in JSON or CSV format to get started. Visualize and prepare it for training."
            linkTo="/dataset"
          />
          <FeatureCard 
            icon={<BrainCircuit className="h-12 w-12 text-purple-500" />}
            title="Train Models"
            description="Choose from classification, regression, or clustering algorithms. Configure and train your model."
            linkTo="/train"
          />
          <FeatureCard 
            icon={<AreaChart className="h-12 w-12 text-green-500" />}
            title="Analyze Results"
            description="Evaluate performance with visualizations and metrics. Make predictions with your trained model."
            linkTo="/visualize"
          />
        </section>
      </div>
    </PageLayout>
  );
};

const FeatureCard = ({ icon, title, description, linkTo }: { 
  icon: React.ReactNode;
  title: string;
  description: string;
  linkTo: string;
}) => (
  <div className="group relative bg-background rounded-lg border p-6 transition-all hover:shadow-md hover:border-primary/40">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground mb-4">{description}</p>
    <Link 
      to={linkTo}
      className="inline-flex items-center text-primary font-medium group-hover:underline"
    >
      Get Started <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
    </Link>
  </div>
);

export default Index;
