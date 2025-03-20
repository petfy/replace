
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Area, 
  AreaChart, 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Legend, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from "recharts";
import { Calendar } from "@/components/ui/calendar";
import { format, subDays, startOfDay, endOfDay, parseISO, isAfter, isBefore, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, BarChart4, LineChart, TrendingUp, Activity, Eye, MousePointerClick, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AnalyticsProps {
  storeId: string;
}

interface StoreAnalytics {
  id: string;
  store_id: string;
  view_count: number;
  click_count: number;
  discount_usage_count: number;
  last_updated: string;
}

interface DailyStats {
  id: string;
  store_id: string;
  date: string;
  view_count: number;
  click_count: number;
  discount_usage_count: number;
}

const dateRanges = [
  { value: "7days", label: "Últimos 7 días" },
  { value: "30days", label: "Últimos 30 días" },
  { value: "90days", label: "Últimos 90 días" },
  { value: "custom", label: "Personalizado" }
];

export const StoreAnalytics = ({ storeId }: AnalyticsProps) => {
  const [analytics, setAnalytics] = useState<StoreAnalytics | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("7days");
  const [customDateRange, setCustomDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");

  const fetchStoreAnalytics = async () => {
    try {
      // Fetch overall analytics
      const { data: analyticsData, error: analyticsError } = await supabase
        .from("store_analytics")
        .select("*")
        .eq("store_id", storeId)
        .single();

      if (analyticsError) {
        console.error("Error fetching store analytics:", analyticsError);
        return;
      }

      setAnalytics(analyticsData);

      // Calculate date range based on selection
      let fromDate: Date;
      let toDate = new Date();
      
      if (dateRange === "7days") {
        fromDate = subDays(toDate, 7);
      } else if (dateRange === "30days") {
        fromDate = subDays(toDate, 30);
      } else if (dateRange === "90days") {
        fromDate = subDays(toDate, 90);
      } else if (dateRange === "custom" && customDateRange.from && customDateRange.to) {
        fromDate = startOfDay(customDateRange.from);
        toDate = endOfDay(customDateRange.to);
      } else {
        fromDate = subDays(toDate, 7); // Default to 7 days
      }

      // Fetch daily stats within date range
      const { data: statsData, error: statsError } = await supabase
        .from("store_daily_stats")
        .select("*")
        .eq("store_id", storeId)
        .gte("date", format(fromDate, "yyyy-MM-dd"))
        .lte("date", format(toDate, "yyyy-MM-dd"))
        .order("date", { ascending: true });

      if (statsError) {
        console.error("Error fetching daily stats:", statsError);
        return;
      }

      setDailyStats(statsData || []);

      // Process data for charts based on view mode
      if (viewMode === "day") {
        // Daily view - use raw data
        setChartData(statsData || []);
      } else if (viewMode === "week" || viewMode === "month") {
        // Group data by week or month
        const groupedData = groupDataByPeriod(statsData || [], viewMode);
        setChartData(groupedData);
      }
    } catch (error) {
      console.error("Error in analytics fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  // Group data by week or month
  const groupDataByPeriod = (data: DailyStats[], mode: "week" | "month") => {
    const groupedMap = new Map();

    data.forEach(stat => {
      const date = parseISO(stat.date);
      let periodStart;
      let periodLabel;

      if (mode === "week") {
        periodStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday as start of week
        periodLabel = `Semana ${format(periodStart, "w")} (${format(periodStart, "dd/MM")})`;
      } else {
        periodStart = startOfMonth(date);
        periodLabel = format(periodStart, "MMMM yyyy", { locale: es });
      }

      const periodKey = format(periodStart, "yyyy-MM-dd");
      
      if (!groupedMap.has(periodKey)) {
        groupedMap.set(periodKey, {
          periodKey,
          periodLabel,
          view_count: 0,
          click_count: 0,
          discount_usage_count: 0,
          days: 0
        });
      }

      const entry = groupedMap.get(periodKey);
      entry.view_count += stat.view_count;
      entry.click_count += stat.click_count;
      entry.discount_usage_count += stat.discount_usage_count;
      entry.days += 1;
    });

    // Convert map to array and sort by period
    return Array.from(groupedMap.values()).sort((a, b) => a.periodKey.localeCompare(b.periodKey));
  };

  // Fill in missing dates in the chart data
  const fillMissingDates = (data: DailyStats[]) => {
    if (!data.length) return [];

    const firstDate = parseISO(data[0].date);
    const lastDate = parseISO(data[data.length - 1].date);
    
    const allDates = eachDayOfInterval({ start: firstDate, end: lastDate });
    const dataByDate = new Map(data.map(item => [item.date, item]));

    return allDates.map(date => {
      const dateStr = format(date, "yyyy-MM-dd");
      return dataByDate.get(dateStr) || {
        id: `temp-${dateStr}`,
        store_id: storeId,
        date: dateStr,
        view_count: 0,
        click_count: 0,
        discount_usage_count: 0
      };
    });
  };

  useEffect(() => {
    if (storeId) {
      fetchStoreAnalytics();
    }
  }, [storeId, dateRange, customDateRange, viewMode]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, "dd/MM/yyyy");
  };

  const formatChartDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    
    if (viewMode === "day") {
      const date = parseISO(dateString);
      return format(date, "dd/MM");
    }
    
    // For week and month views, use the periodLabel directly
    return dateString;
  };

  // Get color for chart based on metric
  const getChartColor = (metric: string) => {
    switch (metric) {
      case "view_count":
        return "#3b82f6"; // blue-500
      case "click_count":
        return "#10b981"; // emerald-500
      case "discount_usage_count":
        return "#f97316"; // orange-500
      default:
        return "#6b7280"; // gray-500
    }
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case "view_count":
        return <Eye className="h-5 w-5 text-blue-500" />;
      case "click_count":
        return <MousePointerClick className="h-5 w-5 text-emerald-500" />;
      case "discount_usage_count":
        return <Ticket className="h-5 w-5 text-orange-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTotalMetric = (data: any[], metric: string) => {
    return data.reduce((sum, item) => sum + (item[metric] || 0), 0);
  };

  const getChangePercent = (data: any[], metric: string) => {
    if (data.length < 2) return 0;
    
    // For daily view, compare first and last week
    if (viewMode === "day") {
      const halfPoint = Math.floor(data.length / 2);
      const firstHalf = data.slice(0, halfPoint);
      const secondHalf = data.slice(halfPoint);
      
      const firstHalfTotal = getTotalMetric(firstHalf, metric);
      const secondHalfTotal = getTotalMetric(secondHalf, metric);
      
      if (firstHalfTotal === 0) return secondHalfTotal > 0 ? 100 : 0;
      
      return Math.round(((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100);
    }
    
    // For week/month view, compare last two periods
    const lastItem = data[data.length - 1];
    const prevItem = data[data.length - 2];
    
    if (!prevItem || prevItem[metric] === 0) return lastItem[metric] > 0 ? 100 : 0;
    
    return Math.round(((lastItem[metric] - prevItem[metric]) / prevItem[metric]) * 100);
  };

  const displayData = viewMode === "day" ? fillMissingDates(dailyStats) : chartData;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Analítica de tu tienda</h2>
          <p className="text-muted-foreground">
            Visualiza el rendimiento de tu tienda en RePlace
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Seleccionar periodo" />
              </SelectTrigger>
              <SelectContent>
                {dateRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {dateRange === "custom" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="ml-2">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customDateRange.from && customDateRange.to
                      ? `${format(customDateRange.from, "dd/MM/yyyy")} - ${format(customDateRange.to, "dd/MM/yyyy")}`
                      : "Seleccionar fechas"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="range"
                    selected={customDateRange}
                    onSelect={setCustomDateRange as any}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>

          <div className="flex gap-1">
            <Button 
              variant={viewMode === "day" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setViewMode("day")}
            >
              Diario
            </Button>
            <Button 
              variant={viewMode === "week" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setViewMode("week")}
            >
              Semanal
            </Button>
            <Button 
              variant={viewMode === "month" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setViewMode("month")}
            >
              Mensual
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-40" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard 
              title="Visitas a tu tienda" 
              value={getTotalMetric(displayData, "view_count")}
              change={getChangePercent(displayData, "view_count")}
              icon={<Eye className="h-4 w-4" />}
              description="Total de visitas a tu página en el directorio"
              color="blue"
            />
            <MetricCard 
              title="Clicks a tu tienda" 
              value={getTotalMetric(displayData, "click_count")}
              change={getChangePercent(displayData, "click_count")}
              icon={<MousePointerClick className="h-4 w-4" />}
              description="Usuarios que hicieron click para visitar tu sitio"
              color="emerald"
            />
            <MetricCard 
              title="Códigos utilizados" 
              value={getTotalMetric(displayData, "discount_usage_count")}
              change={getChangePercent(displayData, "discount_usage_count")}
              icon={<Ticket className="h-4 w-4" />}
              description="Total de códigos de descuento utilizados"
              color="orange"
            />
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LineChart className="mr-2 h-5 w-5" />
                  Tendencia de actividad
                </CardTitle>
                <CardDescription>
                  Visualización de las métricas a lo largo del tiempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {displayData.length > 0 ? (
                    <ChartContainer
                      config={{
                        views: { label: "Visitas", color: "#3b82f6" },
                        clicks: { label: "Clicks", color: "#10b981" },
                        discounts: { label: "Descuentos", color: "#f97316" }
                      }}
                    >
                      <AreaChart
                        data={displayData.map(item => ({
                          date: viewMode === "day" ? item.date : item.periodLabel,
                          views: item.view_count,
                          clicks: item.click_count,
                          discounts: item.discount_usage_count
                        }))}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="colorDiscounts" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          tickFormatter={formatChartDate}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <ChartTooltip
                          content={<ChartTooltipContent />}
                        />
                        <Area
                          type="monotone"
                          dataKey="views"
                          stroke="#3b82f6"
                          fillOpacity={1}
                          fill="url(#colorViews)"
                          activeDot={{ r: 8 }}
                        />
                        <Area
                          type="monotone"
                          dataKey="clicks"
                          stroke="#10b981"
                          fillOpacity={1}
                          fill="url(#colorClicks)"
                          activeDot={{ r: 6 }}
                        />
                        <Area
                          type="monotone"
                          dataKey="discounts"
                          stroke="#f97316"
                          fillOpacity={1}
                          fill="url(#colorDiscounts)"
                          activeDot={{ r: 4 }}
                        />
                        <Legend />
                      </AreaChart>
                    </ChartContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No hay datos disponibles para el período seleccionado</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart4 className="mr-2 h-5 w-5" />
                  Distribución por métrica
                </CardTitle>
                <CardDescription>
                  Comparación de métricas por período
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {displayData.length > 0 ? (
                    <ChartContainer
                      config={{
                        views: { label: "Visitas", color: "#3b82f6" },
                        clicks: { label: "Clicks", color: "#10b981" },
                        discounts: { label: "Descuentos", color: "#f97316" }
                      }}
                    >
                      <BarChart
                        data={displayData.map(item => ({
                          date: viewMode === "day" ? formatDate(item.date) : item.periodLabel,
                          Visitas: item.view_count,
                          Clicks: item.click_count,
                          Descuentos: item.discount_usage_count
                        }))}
                        margin={{ top: 10, right: 10, left: 0, bottom: 30 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12, angle: -45, textAnchor: 'end' }}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <ChartTooltip
                          content={<ChartTooltipContent />}
                        />
                        <Legend />
                        <Bar dataKey="Visitas" fill="#3b82f6" />
                        <Bar dataKey="Clicks" fill="#10b981" />
                        <Bar dataKey="Descuentos" fill="#f97316" />
                      </BarChart>
                    </ChartContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No hay datos disponibles para el período seleccionado</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detalles de Actividad</CardTitle>
              <CardDescription>
                Datos detallados por {viewMode === "day" ? "día" : viewMode === "week" ? "semana" : "mes"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{viewMode === "day" ? "Fecha" : viewMode === "week" ? "Semana" : "Mes"}</TableHead>
                      <TableHead>Visitas</TableHead>
                      <TableHead>Clicks</TableHead>
                      <TableHead>Descuentos Usados</TableHead>
                      <TableHead>Ratio de Conversión</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayData.length > 0 ? (
                      displayData.map((item, index) => {
                        const conversionRate = item.view_count > 0 
                          ? ((item.click_count / item.view_count) * 100).toFixed(1) 
                          : "0.0";
                        
                        return (
                          <TableRow key={index}>
                            <TableCell>
                              {viewMode === "day" ? formatDate(item.date) : item.periodLabel}
                            </TableCell>
                            <TableCell>{item.view_count}</TableCell>
                            <TableCell>{item.click_count}</TableCell>
                            <TableCell>{item.discount_usage_count}</TableCell>
                            <TableCell>{conversionRate}%</TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No hay datos disponibles para el período seleccionado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: number;
  change: number;
  icon: React.ReactNode;
  description: string;
  color: "blue" | "emerald" | "orange" | "gray";
}

const MetricCard = ({ title, value, change, icon, description, color }: MetricCardProps) => {
  const getColorClasses = () => {
    switch (color) {
      case "blue":
        return {
          icon: "bg-blue-100 text-blue-600",
          changePositive: "text-blue-600",
          changeNegative: "text-red-600"
        };
      case "emerald":
        return {
          icon: "bg-emerald-100 text-emerald-600",
          changePositive: "text-emerald-600",
          changeNegative: "text-red-600"
        };
      case "orange":
        return {
          icon: "bg-orange-100 text-orange-600",
          changePositive: "text-orange-600",
          changeNegative: "text-red-600"
        };
      default:
        return {
          icon: "bg-gray-100 text-gray-600",
          changePositive: "text-gray-600",
          changeNegative: "text-red-600"
        };
    }
  };

  const colorClasses = getColorClasses();

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <span className={`p-2 rounded-full ${colorClasses.icon}`}>
            {icon}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        <div className="flex items-center mt-1">
          <span className={change >= 0 ? colorClasses.changePositive : colorClasses.changeNegative}>
            <TrendingUp className={`inline h-4 w-4 ${change < 0 ? "rotate-180" : ""}`} />
            {Math.abs(change)}%
          </span>
          <span className="text-xs text-muted-foreground ml-2">vs período anterior</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">{description}</p>
      </CardContent>
    </Card>
  );
};
