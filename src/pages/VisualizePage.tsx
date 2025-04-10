
import { useState, useEffect, useRef } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, BarChart } from "lucide-react";
import { Chart } from "chart.js/auto";

const sampleDataset = Array.from({ length: 100 }).map((_, i) => ({
  id: i + 1,
  age: Math.floor(Math.random() * 60) + 20,
  income: Math.floor(Math.random() * 100000) + 20000,
  education: ["High School", "Bachelor's", "Master's", "PhD"][Math.floor(Math.random() * 4)],
  creditScore: Math.floor(Math.random() * 500) + 300,
  hasLoan: Math.random() > 0.5,
  loanAmount: Math.random() > 0.5 ? Math.floor(Math.random() * 50000) + 1000 : 0,
  isDefaulter: Math.random() > 0.7
}));

const VisualizePage = () => {
  const [dataset] = useState(sampleDataset);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedChartType, setSelectedChartType] = useState("bar");
  
  const features = dataset && dataset.length > 0 
    ? Object.keys(dataset[0]).filter(key => key !== "id") 
    : [];
  
  const lineChartRef = useRef<HTMLCanvasElement>(null);
  const barChartRef = useRef<HTMLCanvasElement>(null);
  const scatterPlotRef = useRef<HTMLCanvasElement>(null);
  const pieChartRef = useRef<HTMLCanvasElement>(null);
  const histogramRef = useRef<HTMLCanvasElement>(null);
  const boxPlotRef = useRef<HTMLCanvasElement>(null);
  
  const chartInstances = useRef<{[key: string]: Chart}>({});
  
  // Toggle feature selection
  const toggleFeature = (feature: string) => {
    if (selectedFeatures.includes(feature)) {
      setSelectedFeatures(selectedFeatures.filter(f => f !== feature));
    } else if (selectedFeatures.length < 3) {
      // Limit to 3 features for readability
      setSelectedFeatures([...selectedFeatures, feature]);
    }
  };
  
  // Generate random colors for charts
  const generateColors = (count: number) => {
    const baseHues = [220, 180, 120, 350, 275];
    return Array(count).fill(0).map((_, i) => {
      const hue = baseHues[i % baseHues.length];
      return `hsla(${hue}, 70%, 60%, 0.7)`;
    });
  };
  
  // Create charts when dataset or selections change
  useEffect(() => {
    if (!dataset || dataset.length === 0) return;
    
    // Clean up existing charts
    Object.values(chartInstances.current).forEach(chart => chart.destroy());
    chartInstances.current = {};
    
    // Only proceed if features are selected
    if (selectedFeatures.length === 0) return;
    
    // Helper function to get numeric values for a feature
    const getNumericValues = (feature: string) => {
      return dataset
        .map(item => item[feature])
        .filter(value => !isNaN(Number(value)))
        .map(value => Number(value));
    };
    
    // Helper function to count occurrences for categorical data
    const getCategoricalCounts = (feature: string) => {
      const counts: Record<string, number> = {};
      dataset.forEach(item => {
        const value = String(item[feature]);
        counts[value] = (counts[value] || 0) + 1;
      });
      return counts;
    };
    
    // Create line chart
    if (lineChartRef.current && selectedFeatures.length > 0) {
      const ctx = lineChartRef.current.getContext('2d');
      if (ctx) {
        const colors = generateColors(selectedFeatures.length);
        
        chartInstances.current.line = new Chart(ctx, {
          type: 'line',
          data: {
            labels: dataset.slice(0, 50).map((_, i) => i + 1),
            datasets: selectedFeatures.map((feature, i) => ({
              label: feature,
              data: dataset.slice(0, 50).map(item => item[feature]),
              borderColor: colors[i],
              backgroundColor: colors[i].replace('0.7', '0.1'),
              tension: 0.3,
              pointRadius: 2,
              borderWidth: 2
            }))
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: 'Data Trends'
              }
            },
            scales: {
              y: {
                beginAtZero: false
              }
            }
          }
        });
      }
    }
    
    // Create bar chart
    if (barChartRef.current && selectedFeatures.length > 0) {
      const ctx = barChartRef.current.getContext('2d');
      if (ctx) {
        // For first feature, show distribution if categorical, or binned if numeric
        const feature = selectedFeatures[0];
        const isNumeric = !isNaN(Number(dataset[0][feature]));
        
        if (isNumeric) {
          // Create bins for numeric data
          const values = getNumericValues(feature);
          const min = Math.min(...values);
          const max = Math.max(...values);
          const binCount = 10;
          const binSize = (max - min) / binCount;
          
          const bins = Array(binCount).fill(0);
          values.forEach(value => {
            const binIndex = Math.min(Math.floor((value - min) / binSize), binCount - 1);
            bins[binIndex]++;
          });
          
          const binLabels = Array(binCount).fill(0).map((_, i) => {
            const start = min + (i * binSize);
            const end = min + ((i + 1) * binSize);
            return `${start.toFixed(0)}-${end.toFixed(0)}`;
          });
          
          chartInstances.current.bar = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: binLabels,
              datasets: [{
                label: feature,
                data: bins,
                backgroundColor: 'rgba(124, 58, 237, 0.7)',
                borderColor: 'rgba(124, 58, 237, 1)',
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              plugins: {
                legend: {
                  display: false
                },
                title: {
                  display: true,
                  text: `Distribution of ${feature}`
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Count'
                  }
                },
                x: {
                  title: {
                    display: true,
                    text: feature
                  }
                }
              }
            }
          });
        } else {
          // For categorical data
          const counts = getCategoricalCounts(feature);
          const labels = Object.keys(counts);
          const data = Object.values(counts);
          
          chartInstances.current.bar = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: labels,
              datasets: [{
                label: feature,
                data: data,
                backgroundColor: 'rgba(124, 58, 237, 0.7)',
                borderColor: 'rgba(124, 58, 237, 1)',
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              plugins: {
                legend: {
                  display: false
                },
                title: {
                  display: true,
                  text: `Distribution of ${feature}`
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Count'
                  }
                }
              }
            }
          });
        }
      }
    }
    
    // Create scatter plot (if at least 2 features)
    if (scatterPlotRef.current && selectedFeatures.length >= 2) {
      const ctx = scatterPlotRef.current.getContext('2d');
      if (ctx) {
        const feature1 = selectedFeatures[0];
        const feature2 = selectedFeatures[1];
        
        // Only include points where both values are numeric
        const chartData = dataset.filter(item => 
          !isNaN(Number(item[feature1])) && !isNaN(Number(item[feature2]))
        ).map(item => ({
          x: Number(item[feature1]),
          y: Number(item[feature2])
        }));
        
        chartInstances.current.scatter = new Chart(ctx, {
          type: 'scatter',
          data: {
            datasets: [{
              label: `${feature1} vs ${feature2}`,
              data: chartData,
              backgroundColor: 'rgba(75, 192, 192, 0.7)',
              pointRadius: 5,
              pointHoverRadius: 7,
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: `Relationship: ${feature1} vs ${feature2}`
              }
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: feature1
                }
              },
              y: {
                title: {
                  display: true,
                  text: feature2
                }
              }
            }
          }
        });
      }
    }
    
    // Create pie chart for categorical data
    if (pieChartRef.current && selectedFeatures.length > 0) {
      const ctx = pieChartRef.current.getContext('2d');
      if (ctx) {
        // Select a categorical feature if available
        const categoricalFeatures = selectedFeatures.filter(feature => 
          isNaN(Number(dataset[0][feature]))
        );
        
        const feature = categoricalFeatures.length > 0 
          ? categoricalFeatures[0]
          : selectedFeatures[0];
          
        // Get counts of each category
        const counts = getCategoricalCounts(feature);
        const labels = Object.keys(counts);
        const data = Object.values(counts);
        const colors = generateColors(labels.length);
        
        chartInstances.current.pie = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: labels,
            datasets: [{
              label: feature,
              data: data,
              backgroundColor: colors,
              borderWidth: 1,
              borderColor: '#fff'
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'right'
              },
              title: {
                display: true,
                text: `Distribution of ${feature}`
              }
            }
          }
        });
      }
    }
    
    // Create histogram
    if (histogramRef.current && selectedFeatures.length > 0) {
      const ctx = histogramRef.current.getContext('2d');
      if (ctx) {
        // Use first numeric feature
        const numericFeatures = selectedFeatures.filter(feature => 
          !isNaN(Number(dataset[0][feature]))
        );
        
        if (numericFeatures.length > 0) {
          const feature = numericFeatures[0];
          const values = getNumericValues(feature);
          
          chartInstances.current.histogram = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: ['Min', '10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%', 'Max'],
              datasets: [{
                label: feature,
                data: [
                  Math.min(...values),
                  ...Array(9).fill(0).map((_, i) => {
                    const percentile = (i + 1) * 10;
                    const index = Math.floor(values.length * percentile / 100);
                    return values.sort((a, b) => a - b)[index];
                  }),
                  Math.max(...values)
                ],
                backgroundColor: 'rgba(153, 102, 255, 0.7)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              plugins: {
                legend: {
                  display: false
                },
                title: {
                  display: true,
                  text: `Distribution Percentiles: ${feature}`
                }
              },
              scales: {
                y: {
                  beginAtZero: false,
                  title: {
                    display: true,
                    text: 'Value'
                  }
                },
                x: {
                  title: {
                    display: true,
                    text: 'Percentile'
                  }
                }
              }
            }
          });
        }
      }
    }
    
    // Create box plot
    if (boxPlotRef.current && selectedFeatures.length > 0) {
      const ctx = boxPlotRef.current.getContext('2d');
      if (ctx) {
        const numericFeatures = selectedFeatures.filter(feature => 
          !isNaN(Number(dataset[0][feature]))
        );
        
        if (numericFeatures.length > 0) {
          // Simulate box plot data with min, q1, median, q3, max
          const boxPlotData = numericFeatures.map(feature => {
            const values = getNumericValues(feature).sort((a, b) => a - b);
            const min = Math.min(...values);
            const max = Math.max(...values);
            const q1Index = Math.floor(values.length / 4);
            const medianIndex = Math.floor(values.length / 2);
            const q3Index = Math.floor(values.length * 3 / 4);
            
            return {
              feature,
              min,
              q1: values[q1Index],
              median: values[medianIndex],
              q3: values[q3Index],
              max
            };
          });
          
          // Create a horizontal bar chart to simulate box plot
          chartInstances.current.boxPlot = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: boxPlotData.map(d => d.feature),
              datasets: [
                {
                  // Min to Q1
                  label: 'Min to Q1',
                  data: boxPlotData.map(d => d.q1 - d.min),
                  backgroundColor: 'rgba(54, 162, 235, 0.2)',
                  borderColor: 'rgba(54, 162, 235, 1)',
                  borderWidth: 1,
                  stack: 'Stack 0',
                  barPercentage: 0.3
                },
                {
                  // Q1 to Median
                  label: 'Q1 to Median',
                  data: boxPlotData.map(d => d.median - d.q1),
                  backgroundColor: 'rgba(54, 162, 235, 0.5)',
                  borderColor: 'rgba(54, 162, 235, 1)',
                  borderWidth: 1,
                  stack: 'Stack 0',
                  barPercentage: 0.3
                },
                {
                  // Median to Q3
                  label: 'Median to Q3',
                  data: boxPlotData.map(d => d.q3 - d.median),
                  backgroundColor: 'rgba(54, 162, 235, 0.5)',
                  borderColor: 'rgba(54, 162, 235, 1)',
                  borderWidth: 1,
                  stack: 'Stack 0',
                  barPercentage: 0.3
                },
                {
                  // Q3 to Max
                  label: 'Q3 to Max',
                  data: boxPlotData.map(d => d.max - d.q3),
                  backgroundColor: 'rgba(54, 162, 235, 0.2)',
                  borderColor: 'rgba(54, 162, 235, 1)',
                  borderWidth: 1,
                  stack: 'Stack 0',
                  barPercentage: 0.3
                }
              ]
            },
            options: {
              indexAxis: 'y',
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: 'Feature Distribution (Box Plot)'
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      const dataIndex = context.dataIndex;
                      const datasetIndex = context.datasetIndex;
                      const boxPlot = boxPlotData[dataIndex];
                      
                      if (datasetIndex === 0) {
                        return `Min: ${boxPlot.min.toFixed(2)}, Q1: ${boxPlot.q1.toFixed(2)}`;
                      } else if (datasetIndex === 1) {
                        return `Q1: ${boxPlot.q1.toFixed(2)}, Median: ${boxPlot.median.toFixed(2)}`;
                      } else if (datasetIndex === 2) {
                        return `Median: ${boxPlot.median.toFixed(2)}, Q3: ${boxPlot.q3.toFixed(2)}`;
                      } else {
                        return `Q3: ${boxPlot.q3.toFixed(2)}, Max: ${boxPlot.max.toFixed(2)}`;
                      }
                    }
                  }
                },
                legend: {
                  display: false
                }
              },
              scales: {
                x: {
                  stacked: true,
                  beginAtZero: false,
                  title: {
                    display: true,
                    text: 'Value'
                  }
                },
                y: {
                  stacked: true
                }
              }
            }
          });
        }
      }
    }
    
    // Clean up on unmount
    return () => {
      Object.values(chartInstances.current).forEach(chart => chart.destroy());
    };
  }, [dataset, selectedFeatures, selectedChartType]);
  
  return (
    <PageLayout
      title="Data Visualization"
      description="Explore and visualize your dataset with interactive charts"
    >
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Select Features to Visualize</CardTitle>
            <CardDescription>
              Choose up to 3 features to visualize and explore relationships
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {features.map(feature => (
                <Button
                  key={feature}
                  variant={selectedFeatures.includes(feature) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleFeature(feature)}
                  className={selectedFeatures.includes(feature) ? "bg-primary" : ""}
                >
                  {feature}
                </Button>
              ))}
            </div>
            
            {selectedFeatures.length === 0 && (
              <div className="mt-4 text-center p-4 border rounded-md bg-muted/30">
                <p className="text-muted-foreground">
                  Please select at least one feature to visualize
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {selectedFeatures.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Visualizations</h2>
              <Select value={selectedChartType} onValueChange={setSelectedChartType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select chart type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="scatter">Scatter Plot</SelectItem>
                  <SelectItem value="pie">Pie Chart</SelectItem>
                  <SelectItem value="distribution">Distribution</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Tabs defaultValue="charts" className="space-y-4">
              <TabsList>
                <TabsTrigger value="charts">
                  <BarChart className="h-4 w-4 mr-2" />
                  Charts
                </TabsTrigger>
                <TabsTrigger value="advanced">
                  <LineChart className="h-4 w-4 mr-2" />
                  Advanced Analysis
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="charts">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Bar Chart</CardTitle>
                      <CardDescription>
                        Distribution of values by category
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="h-72">
                        <canvas ref={barChartRef} />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Line Chart</CardTitle>
                      <CardDescription>
                        Trends and patterns over sequences
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="h-72">
                        <canvas ref={lineChartRef} />
                      </div>
                    </CardContent>
                  </Card>
                  
                  {selectedFeatures.length >= 2 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Scatter Plot</CardTitle>
                        <CardDescription>
                          Relationship between two variables
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="h-72">
                          <canvas ref={scatterPlotRef} />
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Pie Chart</CardTitle>
                      <CardDescription>
                        Proportional representation of categories
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="h-72">
                        <canvas ref={pieChartRef} />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="advanced">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Distribution Percentiles</CardTitle>
                      <CardDescription>
                        Value distribution across percentiles
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="h-72">
                        <canvas ref={histogramRef} />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Box Plot</CardTitle>
                      <CardDescription>
                        Statistical distribution with quartiles
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="h-72">
                        <canvas ref={boxPlotRef} />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default VisualizePage;
