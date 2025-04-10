
import { useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart3, LineChart, Gauge, PieChart, Info, Award } from "lucide-react";

// Use proper import for Chart.js
import { Chart, type ChartConfiguration } from "chart.js/auto";

interface ModelResultsProps {
  results: any;
}

const ModelResults = ({ results }: ModelResultsProps) => {
  const confusionMatrixRef = useRef<HTMLCanvasElement>(null);
  const accuracyChartRef = useRef<HTMLCanvasElement>(null);
  const featureImportanceRef = useRef<HTMLCanvasElement>(null);
  const gaugeChartRef = useRef<HTMLCanvasElement>(null);
  
  const chartInstances = useRef<{[key: string]: Chart}>({});
  
  useEffect(() => {
    if (!results) return;
    
    // Clean up any existing charts
    Object.values(chartInstances.current).forEach(chart => chart.destroy());
    chartInstances.current = {};
    
    // Create confusion matrix chart if it's a classification model
    if (results.model === "classification" && confusionMatrixRef.current) {
      const ctx = confusionMatrixRef.current.getContext('2d');
      if (ctx) {
        const matrix = results.confusionMatrix;
        
        chartInstances.current.confusionMatrix = new Chart(ctx, {
          type: 'matrix',
          data: {
            datasets: [{
              label: 'Confusion Matrix',
              data: [
                { x: 0, y: 0, v: matrix[0][0] },
                { x: 1, y: 0, v: matrix[0][1] },
                { x: 0, y: 1, v: matrix[1][0] },
                { x: 1, y: 1, v: matrix[1][1] }
              ],
              backgroundColor: (context) => {
                const value = context.dataset.data[context.dataIndex].v;
                const max = Math.max(...matrix.flat());
                const alpha = value / max;
                return `rgba(124, 58, 237, ${alpha})`;
              },
              borderWidth: 1,
              borderColor: 'rgba(124, 58, 237, 0.2)'
            }]
          },
          options: {
            aspectRatio: 1,
            scales: {
              x: {
                type: 'category',
                labels: ['Predicted Negative', 'Predicted Positive'],
                display: true,
                ticks: { display: true },
                grid: { display: false }
              },
              y: {
                type: 'category',
                labels: ['Actual Negative', 'Actual Positive'],
                display: true,
                ticks: { display: true },
                grid: { display: false }
              }
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const value = context.dataset.data[context.dataIndex].v;
                    return `Count: ${value}`;
                  }
                }
              }
            }
          }
        } as ChartConfiguration);
      }
    }
    
    // Create accuracy/metrics chart
    if (accuracyChartRef.current) {
      const ctx = accuracyChartRef.current.getContext('2d');
      if (ctx) {
        let metrics: {[key: string]: number} = {};
        let color: string;
        
        if (results.model === 'classification') {
          metrics = {
            Accuracy: results.metrics.accuracy / 100,
            F1: results.metrics.f1Score,
            Precision: results.metrics.precision,
            Recall: results.metrics.recall,
          };
          color = 'rgba(124, 58, 237, 0.8)';
        } else {
          metrics = {
            'R²': results.metrics.r2,
            'Inv. MSE': 1 - results.metrics.mse,
            'Inv. RMSE': 1 - results.metrics.rmse,
            'Inv. MAE': 1 - results.metrics.mae,
          };
          color = 'rgba(52, 211, 153, 0.8)';
        }
        
        chartInstances.current.metrics = new Chart(ctx, {
          type: 'radar',
          data: {
            labels: Object.keys(metrics),
            datasets: [{
              label: 'Model Performance',
              data: Object.values(metrics),
              backgroundColor: `${color.replace('0.8', '0.2')}`,
              borderColor: color,
              borderWidth: 2,
              pointBackgroundColor: color,
              pointRadius: 4
            }]
          },
          options: {
            scales: {
              r: {
                beginAtZero: true,
                max: 1,
                ticks: {
                  stepSize: 0.2
                }
              }
            },
            plugins: {
              legend: {
                display: false
              }
            }
          }
        });
      }
    }
    
    // Create feature importance chart
    if (featureImportanceRef.current && results.featureImportance) {
      const ctx = featureImportanceRef.current.getContext('2d');
      if (ctx) {
        const featureImportance = results.featureImportance;
        const features = Object.keys(featureImportance);
        const values = Object.values(featureImportance).map(v => parseFloat(v as string));
        
        // Sort by importance
        const combined = features.map((feature, i) => ({ feature, value: values[i] }));
        combined.sort((a, b) => b.value - a.value);
        
        const sortedFeatures = combined.map(item => item.feature);
        const sortedValues = combined.map(item => item.value);
        
        chartInstances.current.featureImportance = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: sortedFeatures,
            datasets: [{
              label: 'Feature Importance',
              data: sortedValues,
              backgroundColor: sortedValues.map((_, i) => {
                const hue = 260 - (i * 25) % 260;
                return `hsla(${hue}, 70%, 60%, 0.8)`;
              }),
              borderWidth: 1
            }]
          },
          options: {
            indexAxis: 'y',
            scales: {
              x: {
                beginAtZero: true
              }
            },
            plugins: {
              legend: {
                display: false
              }
            }
          }
        });
      }
    }
    
    // Create gauge chart for primary metric
    if (gaugeChartRef.current) {
      const ctx = gaugeChartRef.current.getContext('2d');
      if (ctx) {
        const primaryMetric = results.model === 'classification' 
          ? results.metrics.accuracy 
          : results.metrics.r2 * 100;
        
        const color = results.model === 'classification'
          ? 'rgba(124, 58, 237, 0.8)'
          : 'rgba(52, 211, 153, 0.8)';
          
        chartInstances.current.gauge = new Chart(ctx, {
          type: 'doughnut',
          data: {
            datasets: [{
              data: [primaryMetric, 100 - primaryMetric],
              backgroundColor: [
                color,
                'rgba(229, 231, 235, 0.5)'
              ],
              borderWidth: 0,
              circumference: 180,
              rotation: 270
            }]
          },
          options: {
            cutout: '70%',
            plugins: {
              tooltip: { enabled: false },
              legend: { display: false }
            }
          }
        });
      }
    }
    
    return () => {
      // Cleanup on unmount
      Object.values(chartInstances.current).forEach(chart => chart.destroy());
    };
  }, [results]);
  
  if (!results) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Model Results</CardTitle>
          <CardDescription>
            Train a model to view results here
          </CardDescription>
        </CardHeader>
        <CardContent className="h-60 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <LineChart className="h-12 w-12 mx-auto mb-2" />
            <p>No model results available yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Model Results</CardTitle>
            <CardDescription>
              Performance metrics and insights
            </CardDescription>
          </div>
          <Badge className="capitalize" variant="secondary">
            {results.model}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex flex-col space-y-2 items-center justify-center">
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  {results.model === 'classification' ? 'Accuracy' : 'R² Score'}
                </div>
                <div className="relative w-48 h-24">
                  <canvas ref={gaugeChartRef} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-2xl font-bold">
                      {results.model === 'classification' 
                        ? `${results.metrics.accuracy}%` 
                        : results.metrics.r2.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <Award className="h-4 w-4 text-primary mr-1" />
                  <span className="text-sm font-medium">
                    {results.model === 'classification'
                      ? results.metrics.accuracy > 85 ? 'Excellent performance' : 'Good performance'
                      : results.metrics.r2 > 0.9 ? 'Strong correlation' : 'Moderate correlation'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Model Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Model Type</span>
                    <span className="font-medium capitalize">{results.model}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Training Time</span>
                    <span className="font-medium">{results.trainTime}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Train/Test Split</span>
                    <span className="font-medium">{results.trainTestSplit}/{100-results.trainTestSplit}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Epochs</span>
                    <span className="font-medium">{results.hyperparameters.epochs}</span>
                  </div>
                </div>
                
                <div className="bg-muted/40 p-3 rounded-md border text-sm">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium mb-1">Insights</p>
                      <p className="text-muted-foreground">
                        {results.model === 'classification'
                          ? `The model achieved ${results.metrics.accuracy}% accuracy on the test set with an F1 score of ${results.metrics.f1Score}.`
                          : `The model achieved an R² score of ${results.metrics.r2.toFixed(3)} with RMSE of ${results.metrics.rmse.toFixed(3)}.`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="performance">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-4">Metrics Overview</h4>
                <div className="h-60">
                  <canvas ref={accuracyChartRef} />
                </div>
              </div>
              
              {results.model === 'classification' && (
                <div>
                  <h4 className="font-medium mb-4">Confusion Matrix</h4>
                  <div className="h-60">
                    <canvas ref={confusionMatrixRef} />
                  </div>
                </div>
              )}
              
              <div className="md:col-span-2">
                <h4 className="font-medium mb-2">Detailed Metrics</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {results.model === 'classification' ? (
                    <>
                      <MetricCard 
                        label="Accuracy" 
                        value={`${results.metrics.accuracy}%`}
                        icon={<Gauge className="h-4 w-4" />}
                      />
                      <MetricCard 
                        label="F1 Score" 
                        value={results.metrics.f1Score.toFixed(3)}
                        icon={<BarChart3 className="h-4 w-4" />}
                      />
                      <MetricCard 
                        label="Precision" 
                        value={results.metrics.precision.toFixed(3)}
                        icon={<BarChart3 className="h-4 w-4" />}
                      />
                      <MetricCard 
                        label="Recall" 
                        value={results.metrics.recall.toFixed(3)}
                        icon={<BarChart3 className="h-4 w-4" />}
                      />
                    </>
                  ) : (
                    <>
                      <MetricCard 
                        label="R² Score" 
                        value={results.metrics.r2.toFixed(3)}
                        icon={<Gauge className="h-4 w-4" />}
                      />
                      <MetricCard 
                        label="MSE" 
                        value={results.metrics.mse.toFixed(4)}
                        icon={<BarChart3 className="h-4 w-4" />}
                      />
                      <MetricCard 
                        label="RMSE" 
                        value={results.metrics.rmse.toFixed(4)}
                        icon={<BarChart3 className="h-4 w-4" />}
                      />
                      <MetricCard 
                        label="MAE" 
                        value={results.metrics.mae.toFixed(4)}
                        icon={<BarChart3 className="h-4 w-4" />}
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="features">
            <h4 className="font-medium mb-4">Feature Importance</h4>
            <div className="h-80">
              <canvas ref={featureImportanceRef} />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

const MetricCard = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => {
  return (
    <div className="bg-muted/40 p-3 rounded-md border">
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-primary">{icon}</span>
      </div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
};

export default ModelResults;
