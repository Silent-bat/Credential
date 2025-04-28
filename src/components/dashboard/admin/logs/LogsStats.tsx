import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type LogsStatsProps = {
  stats: {
    categories: Array<{
      category: string;
      count: number;
    }>;
  };
};

export function LogsStats({ stats }: LogsStatsProps) {
  const t = useTranslations('admin.logs');

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.categories.map((item) => (
        <Card key={item.category}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t(`categories.${item.category}`)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.count}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 