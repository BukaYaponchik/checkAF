import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getDailyReportById } from '@/services/api';
import { type DailyReport } from '@/types';
import { useToast } from '@/hooks/use-toast';
import ReportDetails from '@/components/ReportDetails';

const ManagerReportDetailsPage: React.FC = () => {
  const { user } = useAuth();
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<DailyReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!reportId) {
        setError("Идентификатор отчета не найден");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Загружаем отчет по ID
        const reportData = await getDailyReportById(reportId);

        if (!reportData) {
          setError("Отчет не найден");
          return;
        }

        // Проверяем, принадлежит ли отчет текущему пользователю
        if (user && reportData.userId !== user.id) {
          setError("У вас нет доступа к этому отчету");
          toast({
            title: 'Доступ запрещен',
            description: 'У вас нет прав для просмотра этого отчета',
            variant: 'destructive',
          });
          return;
        }

        setReport(reportData);
      } catch (error) {
        console.error('Ошибка при загрузке отчета:', error);
        setError("Не удалось загрузить данные отчета");
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить данные отчета',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId, user, toast]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-gray-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Детали отчета</h1>
        <div className="p-6 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-lg font-medium text-red-600">{error}</h3>
          <p className="mt-2 text-gray-600">Вернитесь к списку отчетов или попробуйте позже.</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            onClick={() => navigate('/manager/reports')}
          >
            Вернуться к списку отчетов
          </button>
        </div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  return <ReportDetails report={report} backUrl="/manager/reports" backLabel="Назад к моим отчетам" />;
};

export default ManagerReportDetailsPage;
