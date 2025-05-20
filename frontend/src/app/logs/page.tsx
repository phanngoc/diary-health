"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar.css';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import './datepicker.css';
import moment from 'moment';
import 'moment/locale/vi';
import { toast } from "sonner";

// Import the MedicationLogList component
import { MedicationLogList } from "@/components/medication-log-list";

// Cấu hình moment.js với locale tiếng Việt
moment.locale('vi');
const localizer = momentLocalizer(moment);

interface Medication {
  id: number;
  name: string;
  dosage: string;
  type?: string;
}

interface MedicationLog {
  id: number;
  medications: Medication[];
  taken_at: string;
  notes?: string;
  feeling_after?: string;
  created_at: string;
  updated_at: string;
  user_id: number;
}

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: MedicationLog;
}

// Hàm định dạng ngày tháng
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function MedicationLogsPage() {
  const { data: session } = useSession();
  const [medicationLogs, setMedicationLogs] = useState<MedicationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [selectedEvent, setSelectedEvent] = useState<MedicationLog | null>(null);
  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());
  
  // Search and filtering state
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [selectedMedicationTypes, setSelectedMedicationTypes] = useState<string[]>([]);
  const [availableMedicationTypes, setAvailableMedicationTypes] = useState<string[]>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter medication logs based on search, date range, and medication type
  const filteredLogs = useMemo(() => {
    return medicationLogs.filter(log => {
      // Search filter
      const matchesSearch = searchQuery === "" || 
        (log.medications && log.medications.some(med => 
          med.name.toLowerCase().includes(searchQuery.toLowerCase())
        )) ||
        (log.notes && log.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (log.feeling_after && log.feeling_after.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Date range filter
      const logDate = new Date(log.taken_at);
      const matchesDateRange = 
        (!dateRange[0] || logDate >= dateRange[0]) && 
        (!dateRange[1] || logDate <= dateRange[1]);
      
      // Medication type filter
      const matchesMedicationType = 
        selectedMedicationTypes.length === 0 || 
        (log.medications && log.medications.some(med => 
          med.type && selectedMedicationTypes.includes(med.type)
        ));
      
      return matchesSearch && matchesDateRange && matchesMedicationType;
    });
  }, [medicationLogs, searchQuery, dateRange, selectedMedicationTypes]);

  // Calculate the current page slice of logs
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredLogs.slice(startIndex, endIndex);
  }, [filteredLogs, currentPage, itemsPerPage]);

  // Calculate total number of pages
  const totalPages = useMemo(() => {
    return Math.ceil(filteredLogs.length / itemsPerPage);
  }, [filteredLogs, itemsPerPage]);

  // Function to clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setDateRange([null, null]);
    setSelectedMedicationTypes([]);
  };

  // Map medication logs to calendar events
  const events = useMemo(() => {
    return filteredLogs.map((log): CalendarEvent => {
      const start = new Date(log.taken_at);
      // Create an end date 30 minutes after start
      const end = new Date(start.getTime() + 30 * 60000);
      
      // Get medication names for the title
      const title = log.medications && log.medications.length > 0
        ? log.medications.map(med => med.name).join(", ")
        : "Thuốc không xác định";
        
      return {
        id: log.id,
        title,
        start,
        end,
        resource: log,
      };
    });
  }, [filteredLogs]);

  // Function to navigate between pages
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, dateRange, selectedMedicationTypes]);

  useEffect(() => {
    if (session?.accessToken) {
      fetchMedicationLogs();
    }
  }, [session]);

  // Extract unique medication types from logs
  useEffect(() => {
    const types = new Set<string>();
    medicationLogs.forEach(log => {
      if (log.medications) {
        log.medications.forEach(med => {
          if (med.type) {
            types.add(med.type);
          }
        });
      }
    });
    setAvailableMedicationTypes(Array.from(types).sort());
  }, [medicationLogs]);

  const fetchMedicationLogs = async () => {
    try {
      // Get token from session or localStorage
      const token = session?.accessToken || localStorage.getItem("token") || "";
      
      const response = await fetch("/api/medication-logs", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch medication logs");
      }

      const data = await response.json();
      
      // Sort logs by taken_at date, newest first
      const sortedLogs = data.sort((a: MedicationLog, b: MedicationLog) => 
        new Date(b.taken_at).getTime() - new Date(a.taken_at).getTime()
      );
      
      setMedicationLogs(sortedLogs);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching medication logs:", error);
      setError("Failed to fetch medication logs. Please try again later.");
      setLoading(false);
    }
  };

  const handleMarkAsTaken = async (medicationIds: number[]) => {
    if (!medicationIds.length) {
      toast.error("Không có thuốc nào được chọn");
      return;
    }

    try {
      // Get token from session or localStorage
      const token = session?.accessToken || localStorage.getItem("token") || "";
      
      const response = await fetch("http://localhost:8001/api/medication-logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          medication_ids: medicationIds,
          taken_at: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark medications as taken");
      }

      toast.success("Đã ghi nhận việc uống thuốc thành công");
      
      // Refresh medication logs
      fetchMedicationLogs();
    } catch (error) {
      console.error("Error marking medications as taken:", error);
      toast.error("Không thể ghi nhận việc uống thuốc. Vui lòng thử lại sau.");
    }
  };

  // Function to export logs as CSV
  const exportLogsAsCSV = () => {
    // Only export filtered logs
    if (filteredLogs.length === 0) {
      toast.error("Không có dữ liệu để xuất");
      return;
    }
    
    try {
      // CSV header
      let csvContent = "Ngày uống,Thuốc,Liều lượng,Loại thuốc,Ghi chú,Cảm nhận\n";
      
      // Add each log as a row
      filteredLogs.forEach((log: MedicationLog) => {
        const date = new Date(log.taken_at).toLocaleDateString("vi-VN");
        
        if (log.medications && log.medications.length > 0) {
          log.medications.forEach((med: Medication) => {
            const row = [
              date,
              med.name,
              med.dosage,
              med.type || "",
              log.notes?.replace(/,/g, ";") || "",
              log.feeling_after?.replace(/,/g, ";") || ""
            ];
            csvContent += row.join(",") + "\n";
          });
        } else {
          const row = [
            date,
            "Không có thông tin",
            "",
            "",
            log.notes?.replace(/,/g, ";") || "",
            log.feeling_after?.replace(/,/g, ";") || ""
          ];
          csvContent += row.join(",") + "\n";
        }
      });
      
      // Create a blob and download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      
      // Create download link and trigger it
      const link = document.createElement("a");
      const filename = `lich-su-thuoc-${new Date().toISOString().slice(0, 10)}.csv`;
      
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Đã xuất dữ liệu thành công");
    } catch (error) {
      console.error("Error exporting logs:", error);
      toast.error("Không thể xuất dữ liệu. Vui lòng thử lại sau.");
    }
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event.resource);
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    return {
      style: {
        backgroundColor: '#4F46E5',
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        padding: '2px 5px'
      }
    };
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-start">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-red-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Lịch sử uống thuốc</h1>
          <div className="flex gap-2">
            <Button 
              variant={viewMode === "calendar" ? "default" : "outline"} 
              onClick={() => setViewMode("calendar")}
              className="flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Lịch
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              onClick={() => setViewMode("list")}
              className="flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
              Danh sách
            </Button>
          </div>
        </div>
      </div>

      {medicationLogs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-10 py-16">
            <div className="text-center space-y-5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-muted-foreground/50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <div>
                <p className="text-xl font-medium mb-2">Chưa có lịch sử thuốc</p>
                <p className="text-center text-muted-foreground max-w-md mx-auto">
                  Chưa có lịch sử uống thuốc nào được ghi lại. Khi bạn uống thuốc, thông tin sẽ được hiển thị ở đây.
                </p>
              </div>
              <Button asChild>
                <Link href="/medications">
                  Đi đến danh sách thuốc
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : viewMode === "calendar" ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card className="h-[700px]">
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Lịch thuốc</CardTitle>
                  <div className="flex items-center gap-2">
                    <DatePicker
                      selected={date}
                      onChange={(date: Date | null) => date && setDate(date)}
                      dateFormat="dd/MM/yyyy"
                      className="h-9 w-32 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setDate(new Date())}
                    >
                      Hôm nay
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-full">
                  <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: "100%" }}
                    views={['month', 'week', 'day', 'agenda']}
                    defaultView={Views.MONTH}
                    view={view as any}
                    onView={(newView) => setView(newView as any)}
                    date={date}
                    onNavigate={date => setDate(date)}
                    onSelectEvent={handleSelectEvent}
                    eventPropGetter={eventStyleGetter}
                    selectable={true}
                    onSelectSlot={(slotInfo) => {
                      if (session) {
                        window.location.href = `/medications/new?date=${slotInfo.start.toISOString()}`;
                      } else {
                        toast.error("Bạn cần đăng nhập để thêm thuốc mới");
                      }
                    }}
                    tooltipAccessor={event => {
                      const log = event.resource;
                      const meds = log.medications && log.medications.length > 0 
                        ? log.medications.map((m: any) => `${m.name} (${m.dosage})`).join(", ")
                        : "Không có thông tin thuốc";
                      return `${formatDate(log.taken_at)}\n${meds}`;
                    }}
                    messages={{
                      month: 'Tháng',
                      week: 'Tuần',
                      day: 'Ngày',
                      agenda: 'Lịch trình',
                      previous: 'Trước',
                      next: 'Sau',
                      today: 'Hôm nay',
                      showMore: total => `+ Xem thêm (${total})`
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            {selectedEvent ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Chi tiết thuốc</CardTitle>
                  <CardDescription className="text-sm">
                    <span className="inline-block bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-md px-2 py-1">
                      {formatDate(selectedEvent.taken_at)}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-1 text-indigo-600 dark:text-indigo-400">Thuốc:</h3>
                      <ul className="space-y-1">
                        {selectedEvent.medications && selectedEvent.medications.length > 0 ? (
                          selectedEvent.medications.map(med => (
                            <li key={med.id} className="flex items-center gap-2">
                              <span className="inline-block w-2 h-2 rounded-full bg-indigo-500"></span>
                              <span>
                                {med.name} 
                                <span className="text-sm text-muted-foreground">
                                  ({med.dosage})
                                  {med.type && ` - ${med.type}`}
                                </span>
                              </span>
                            </li>
                          ))
                        ) : (
                          <li className="text-muted-foreground">Không có thông tin thuốc</li>
                        )}
                      </ul>
                    </div>
                    {selectedEvent.notes && (
                      <div>
                        <h3 className="font-medium mb-1 text-indigo-600 dark:text-indigo-400">Ghi chú:</h3>
                        <p className="text-muted-foreground border-l-2 border-indigo-200 dark:border-indigo-800 pl-3 py-1">{selectedEvent.notes}</p>
                      </div>
                    )}
                    {selectedEvent.feeling_after && (
                      <div>
                        <h3 className="font-medium mb-1 text-indigo-600 dark:text-indigo-400">Cảm nhận:</h3>
                        <p className="text-muted-foreground border-l-2 border-indigo-200 dark:border-indigo-800 pl-3 py-1">{selectedEvent.feeling_after}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2 items-start">
                  <p className="text-xs text-muted-foreground">
                    Đã tạo: {formatDate(selectedEvent.created_at)}
                  </p>
                  <div className="flex gap-2 w-full mt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full" 
                      asChild
                    >
                      <Link href={`/medications/${selectedEvent.medications?.[0]?.id || ''}`}>
                        Xem thuốc
                      </Link>
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        const medicationIds = selectedEvent.medications && selectedEvent.medications.length > 0
                          ? selectedEvent.medications.map(med => med.id)
                          : [];
                        handleMarkAsTaken(medicationIds);
                      }}
                    >
                      Ghi nhận lại
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px]">
                  <div className="text-center space-y-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 mx-auto text-muted-foreground/50"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-center text-muted-foreground">
                      Chọn một sự kiện trên lịch để xem chi tiết
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <MedicationLogList
          medicationLogs={filteredLogs}
          onSearch={setSearchQuery}
          onFilterByDate={setDateRange}
          onFilterByType={setSelectedMedicationTypes}
          onClearFilters={clearFilters}
          onTakeMedication={handleMarkAsTaken}
          onExportLogs={exportLogsAsCSV}
          searchQuery={searchQuery}
          dateRange={dateRange}
          selectedTypes={selectedMedicationTypes}
          availableTypes={availableMedicationTypes}
          formatDate={formatDate}
        />
      )}
    </div>
  );
}