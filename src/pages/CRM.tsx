import { Card } from '@/components/ui/card';

export default function CRM() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">CRM</h1>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Sistema CRM em migração para Supabase</p>
          <p className="text-sm text-muted-foreground mt-2">Esta página será completamente refatorada em breve</p>
        </Card>
      </div>
    </div>
  );
}
