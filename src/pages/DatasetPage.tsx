
import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import DatasetUploader from "@/components/dataset/DatasetUploader";
import DatasetPreview from "@/components/dataset/DatasetPreview";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Search, BarChart2, ListFilter, Download, FileUp, ChevronRight, FileJson, UploadCloud } from "lucide-react";

const DatasetPage = () => {
  const [dataset, setDataset] = useState<Record<string, any>[] | null>(null);
  const [datasetStats, setDatasetStats] = useState<Record<string, any> | null>(null);
  
  const handleDatasetUploaded = (data: any[]) => {
    setDataset(data);
    
    // Calculate basic statistics for the dataset
    if (data && data.length > 0) {
      const stats = {
        rowCount: data.length,
        columnCount: Object.keys(data[0]).length,
        columns: {} as Record<string, {
          type: string;
          unique: number;
          missing: number;
          min?: number;
          max?: number;
          mean?: number;
        }>
      };
      
      // Calculate stats for each column
      Object.keys(data[0]).forEach(column => {
        const values = data.map(row => row[column]);
        const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== "");
        const numericValues = nonNullValues.filter(v => !isNaN(Number(v))).map(v => Number(v));
        
        const columnType = numericValues.length === nonNullValues.length ? "numeric" : "categorical";
        
        const uniqueValues = new Set(values).size;
        const missingValues = values.length - nonNullValues.length;
        
        const columnStats: any = {
          type: columnType,
          unique: uniqueValues,
          missing: missingValues,
        };
        
        // Add numeric stats if applicable
        if (columnType === "numeric" && numericValues.length > 0) {
          columnStats.min = Math.min(...numericValues);
          columnStats.max = Math.max(...numericValues);
          columnStats.mean = numericValues.reduce((acc, val) => acc + val, 0) / numericValues.length;
        }
        
        stats.columns[column] = columnStats;
      });
      
      setDatasetStats(stats);
    }
  };
  
  return (
    <PageLayout
      title="Dataset Management"
      description="Upload, explore, and prepare your datasets for machine learning"
    >
      <div className="space-y-8">
        {!dataset ? (
          <>
            <div className="text-center py-4 max-w-2xl mx-auto">
              <UploadCloud className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Upload Your Dataset</h2>
              <p className="text-muted-foreground mb-8">
                Upload your data in JSON or CSV format to get started with exploring and training machine learning models.
              </p>
            </div>
            
            <DatasetUploader onDatasetUploaded={handleDatasetUploaded} />
            
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <Card>
                <CardHeader className="pb-2">
                  <FileJson className="h-8 w-8 mb-2 text-blue-500" />
                  <CardTitle>JSON Format</CardTitle>
                  <CardDescription>
                    Upload data in JSON array format
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-3 rounded-md overflow-x-auto text-xs">
{`[
  {
    "feature1": "value1",
    "feature2": 42,
    "feature3": true
  },
  {
    "feature1": "value2",
    "feature2": 73,
    "feature3": false
  }
]`}
                  </pre>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <FileUp className="h-8 w-8 mb-2 text-green-500" />
                  <CardTitle>CSV Format</CardTitle>
                  <CardDescription>
                    Upload data in CSV format
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-3 rounded-md overflow-x-auto text-xs">
{`feature1,feature2,feature3
value1,42,true
value2,73,false
value3,28,true`}
                  </pre>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Dataset Preview</h2>
                <p className="text-muted-foreground">
                  {datasetStats?.rowCount} rows, {datasetStats?.columnCount} columns
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button size="sm" asChild>
                  <Link to="/train">
                    Train Model <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            
            <Tabs defaultValue="data">
              <TabsList>
                <TabsTrigger value="data">
                  <Search className="h-4 w-4 mr-2" />
                  Data View
                </TabsTrigger>
                <TabsTrigger value="stats">
                  <BarChart2 className="h-4 w-4 mr-2" />
                  Statistics
                </TabsTrigger>
                <TabsTrigger value="filters">
                  <ListFilter className="h-4 w-4 mr-2" />
                  Filters
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="data" className="mt-4">
                <DatasetPreview data={dataset} />
              </TabsContent>
              
              <TabsContent value="stats" className="mt-4">
                {datasetStats && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Dataset Statistics</CardTitle>
                      <CardDescription>
                        Basic statistical properties of your dataset
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="flex flex-wrap gap-4">
                          <StatCard 
                            label="Total Rows" 
                            value={datasetStats.rowCount} 
                          />
                          <StatCard 
                            label="Total Columns" 
                            value={datasetStats.columnCount} 
                          />
                          <StatCard 
                            label="Numeric Features" 
                            value={Object.values(datasetStats.columns).filter((c: any) => c.type === 'numeric').length} 
                          />
                          <StatCard 
                            label="Categorical Features" 
                            value={Object.values(datasetStats.columns).filter((c: any) => c.type === 'categorical').length} 
                          />
                        </div>
                        
                        <h3 className="text-lg font-medium">Column Details</h3>
                        <div className="border rounded-lg overflow-hidden">
                          <table className="min-w-full">
                            <thead className="bg-muted/50">
                              <tr>
                                <th className="py-2 px-4 text-left font-medium text-sm">Feature Name</th>
                                <th className="py-2 px-4 text-left font-medium text-sm">Type</th>
                                <th className="py-2 px-4 text-left font-medium text-sm">Unique Values</th>
                                <th className="py-2 px-4 text-left font-medium text-sm">Missing Values</th>
                                <th className="py-2 px-4 text-left font-medium text-sm">Range/Stats</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {Object.entries(datasetStats.columns).map(([name, stats]: [string, any]) => (
                                <tr key={name} className="hover:bg-muted/30">
                                  <td className="py-2 px-4 font-medium">{name}</td>
                                  <td className="py-2 px-4 capitalize">{stats.type}</td>
                                  <td className="py-2 px-4">{stats.unique}</td>
                                  <td className="py-2 px-4">
                                    {stats.missing} 
                                    {stats.missing > 0 && (
                                      <span className="text-red-500 ml-1">
                                        ({((stats.missing / datasetStats.rowCount) * 100).toFixed(1)}%)
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2 px-4">
                                    {stats.type === 'numeric' ? (
                                      <>
                                        {stats.min?.toFixed(2)} to {stats.max?.toFixed(2)} 
                                        <span className="text-muted-foreground ml-2">
                                          (avg: {stats.mean?.toFixed(2)})
                                        </span>
                                      </>
                                    ) : (
                                      <span className="text-muted-foreground">—</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="filters" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Data Filtering and Preprocessing</CardTitle>
                    <CardDescription>
                      Filter and clean your dataset before training
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Filter Data</h3>
                          <div className="flex gap-2">
                            <Input placeholder="Column name contains..." />
                            <Button variant="secondary">Apply</Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Missing Value Handling</h3>
                          <div className="flex gap-2">
                            <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                              <option value="remove_rows">Remove rows with missing values</option>
                              <option value="fill_mean">Fill with mean (numeric)</option>
                              <option value="fill_mode">Fill with mode (categorical)</option>
                              <option value="fill_zero">Fill with zero</option>
                            </select>
                            <Button variant="secondary">Apply</Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-muted/40 p-4 rounded-md border text-sm">
                        <p className="font-medium mb-1">Preprocessing Options</p>
                        <p className="text-muted-foreground mb-4">These actions will modify your dataset. You can download the original or processed dataset at any time.</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          <Button variant="outline" size="sm" className="justify-start">Normalize Data</Button>
                          <Button variant="outline" size="sm" className="justify-start">Standardize Data</Button>
                          <Button variant="outline" size="sm" className="justify-start">Encode Categories</Button>
                          <Button variant="outline" size="sm" className="justify-start">Drop Duplicates</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-6">
                    <Button variant="outline">Reset All Filters</Button>
                    <Button>Apply Changes</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

const StatCard = ({ label, value }: { label: string; value: number }) => (
  <div className="bg-muted/40 p-3 rounded-lg border min-w-[120px]">
    <div className="text-sm text-muted-foreground">{label}</div>
    <div className="text-2xl font-semibold">{value}</div>
  </div>
);

export default DatasetPage;
