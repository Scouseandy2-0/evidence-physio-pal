import { useState } from "react";
import { Header } from "@/components/Header";
import { AssessmentToolsLibrary } from "@/components/conditions/AssessmentToolsLibrary";
import { InteractiveAssessmentEngine } from "@/components/assessment/InteractiveAssessmentEngine";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const AssessmentsPage = () => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [assessmentMode, setAssessmentMode] = useState<'library' | 'interactive'>('library');

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId);
    setAssessmentMode('interactive');
  };

  const handleBackToLibrary = () => {
    setSelectedTool(null);
    setAssessmentMode('library');
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {assessmentMode === 'library' ? (
          <AssessmentToolsLibrary onToolSelect={handleToolSelect} />
        ) : selectedTool ? (
          <div className="space-y-6">
            <Button variant="outline" onClick={handleBackToLibrary}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Assessment Library
            </Button>
            <InteractiveAssessmentEngine 
              toolId={selectedTool} 
              onComplete={handleBackToLibrary}
              onBack={handleBackToLibrary}
            />
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default AssessmentsPage;