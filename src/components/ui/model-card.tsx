
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, FileText, Clock, PlayCircle } from "lucide-react";

interface ModelCardProps {
  name: string;
  description: string;
  type: string;
  lastRun?: string;
  accuracy?: number;
  onRun?: () => void;
  onView?: () => void;
}

const ModelCard = ({ name, description, type, lastRun, accuracy, onRun, onView }: ModelCardProps) => {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{name}</CardTitle>
          <Badge variant="outline" className="flex items-center gap-1">
            <Brain className="h-3 w-3" /> {type}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          {lastRun && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Last run: {lastRun}</span>
            </div>
          )}
          {accuracy !== undefined && (
            <div className="mt-2">
              <div className="text-sm font-medium mb-1">Accuracy</div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-secondary"
                  style={{ width: `${accuracy}%` }}
                />
              </div>
              <div className="text-xs text-right mt-1">{accuracy.toFixed(1)}%</div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 pt-2">
        {onRun && (
          <Button onClick={onRun} variant="default" size="sm" className="w-full">
            <PlayCircle className="h-4 w-4 mr-2" /> Run Model
          </Button>
        )}
        {onView && (
          <Button onClick={onView} variant="outline" size="sm" className="w-full">
            <FileText className="h-4 w-4 mr-2" /> View Details
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ModelCard;
