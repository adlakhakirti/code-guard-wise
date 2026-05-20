import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import TopBar from "@/components/TopBar";
import CodeInputPanel from "@/components/CodeInputPanel";
import ResultsPanel from "@/components/ResultsPanel";
import type { ReviewResult } from "@/components/ResultsPanel";

const Index = () => {
  const [securityAware, setSecurityAware] = useState(true);
  const [code, setCode] = useState("");
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);



  const handleSubmit = async () => {
    if (!code.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("review-code", {
        body: { code, securityAware },
      });

      if (fnError) throw fnError;
      if (!data || !data.quality) throw new Error("Invalid response");

      setResult(data as ReviewResult);
    } catch (e) {
      console.error(e);
      setError("Review unavailable — please try again");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar securityAware={securityAware} onToggle={setSecurityAware} />



      <main className="flex-1 flex flex-col md:flex-row">
        <section className="w-full md:w-[40%] border-r border-border/60 p-5 md:p-6">
          <CodeInputPanel
            code={code}
            onCodeChange={setCode}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </section>

        <section className="w-full md:w-[60%] p-5 md:p-6 overflow-y-auto">
          <ResultsPanel result={result} isLoading={isLoading} error={error} />
        </section>
      </main>
    </div>
  );
};

export default Index;
