import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';

interface MedicationLogListProps {
  medicationLogs: any[];
  onSearch: (query: string) => void;
  onFilterByDate: (range: [Date | null, Date | null]) => void;
  onFilterByType: (types: string[]) => void;
  onClearFilters: () => void;
  onTakeMedication: (medicationIds: number[]) => void;
  onExportLogs?: () => void; // New export functionality
  searchQuery: string;
  dateRange: [Date | null, Date | null];
  selectedTypes: string[];
  availableTypes: string[];
  formatDate: (date: string) => string;
}

export function MedicationLogList({
  medicationLogs,
  onSearch,
  onFilterByDate,
  onFilterByType,
  onClearFilters,
  onTakeMedication,
  onExportLogs,
  searchQuery,
  dateRange,
  selectedTypes,
  availableTypes,
  formatDate,
}: MedicationLogListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Calculate the current page slice of logs
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return medicationLogs.slice(startIndex, endIndex);
  }, [medicationLogs, currentPage, itemsPerPage]);

  // Calculate total number of pages
  const totalPages = useMemo(() => {
    return Math.ceil(medicationLogs.length / itemsPerPage);
  }, [medicationLogs, itemsPerPage]);

  // Function to navigate between pages
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <div className="mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Tìm kiếm và Lọc</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="md:col-span-2">
                <Label htmlFor="search" className="mb-2 block">Tìm kiếm</Label>
                <Input
                  id="search"
                  placeholder="Tìm kiếm theo tên thuốc hoặc ghi chú..."
                  value={searchQuery}
                  onChange={(e) => onSearch(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div>
                <Label htmlFor="date-range" className="mb-2 block">Khoảng thời gian</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-left font-normal"
                      id="date-range"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2"
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
                      {dateRange[0] && dateRange[1] 
                        ? `${format(dateRange[0], 'dd/MM/yyyy')} - ${format(dateRange[1], 'dd/MM/yyyy')}` 
                        : "Chọn khoảng thời gian"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-3">
                      <DatePicker
                        selectsRange={true}
                        startDate={dateRange[0]}
                        endDate={dateRange[1]}
                        onChange={(update) => {
                          onFilterByDate(update);
                        }}
                        dateFormat="dd/MM/yyyy"
                        inline
                      />
                      <div className="flex justify-end gap-2 mt-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onFilterByDate([null, null])}
                        >
                          Xóa
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => {
                            if (dateRange[0] && !dateRange[1]) {
                              // If only start date is set, set end date to start date
                              onFilterByDate([dateRange[0], dateRange[0]]);
                            }
                          }}
                        >
                          Áp dụng
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <Label htmlFor="medication-type" className="mb-2 block">Loại thuốc</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-left font-normal"
                      id="medication-type"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                        />
                      </svg>
                      {selectedTypes.length
                        ? `${selectedTypes.length} loại thuốc được chọn`
                        : "Chọn loại thuốc"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {availableTypes.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        Không có loại thuốc nào
                      </div>
                    ) : (
                      availableTypes.map((type) => (
                        <DropdownMenuCheckboxItem
                          key={type}
                          checked={selectedTypes.includes(type)}
                          onCheckedChange={(checked: boolean) => {
                            if (checked) {
                              onFilterByType([...selectedTypes, type]);
                            } else {
                              onFilterByType(
                                selectedTypes.filter((t) => t !== type)
                              );
                            }
                          }}
                        >
                          {type}
                        </DropdownMenuCheckboxItem>
                      ))
                    )}
                    {selectedTypes.length > 0 && (
                      <div className="border-t border-border px-2 py-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-center"
                          onClick={() => onFilterByType([])}
                        >
                          Xóa tất cả
                        </Button>
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {/* Filter Summary and Clear Button */}
            {(searchQuery || dateRange[0] || selectedTypes.length > 0) && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Hiển thị {medicationLogs.length} kết quả 
                </div>
                <div className="flex gap-2">
                  {onExportLogs && medicationLogs.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={onExportLogs}
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
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                      Xuất CSV
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={onClearFilters}
                  >
                    Xóa bộ lọc
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Medication Log List */}
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <div>
                <p className="text-xl font-medium mb-2">Không tìm thấy kết quả phù hợp</p>
                <p className="text-center text-muted-foreground max-w-md mx-auto">
                  Không tìm thấy thuốc nào phù hợp với bộ lọc đã chọn. Hãy thử thay đổi các điều kiện lọc.
                </p>
              </div>
              <Button 
                variant="outline"
                onClick={onClearFilters}
              >
                Xóa bộ lọc
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {paginatedLogs.map((log) => (
              <Card key={log.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>
                        {log.medications && log.medications.length > 0 
                          ? log.medications.map((med: any) => med.name).join(", ")
                          : "Thuốc không xác định"}
                      </CardTitle>
                      <CardDescription>
                        {log.medications && log.medications.length > 0 
                          ? log.medications.map((med: any) => (
                              <span key={med.id} className="inline-flex items-center mr-2">
                                {`${med.name} (${med.dosage})`}
                                {med.type && (
                                  <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                                    {med.type}
                                  </span>
                                )}
                              </span>
                            ))
                          : "Không có thông tin về liều lượng"}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatDate(log.taken_at)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <div>
                      <p className="font-medium">Ghi chú:</p>
                      <p className="text-muted-foreground">{log.notes || "Không có ghi chú"}</p>
                    </div>
                    {log.feeling_after && (
                      <div>
                        <p className="font-medium">Cảm nhận sau khi uống:</p>
                        <p className="text-muted-foreground">
                          {log.feeling_after}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/40 border-t">
                  <div className="flex justify-between items-center w-full">
                    <p className="text-xs text-muted-foreground">
                      Đã tạo: {formatDate(log.created_at)}
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        asChild
                      >
                        <Link href={`/medications/${log.medications?.[0]?.id || ''}`}>
                          Xem thuốc
                        </Link>
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={() => {
                          const medicationIds = log.medications && log.medications.length > 0
                            ? log.medications.map((med: any) => med.id)
                            : [];
                          onTakeMedication(medicationIds);
                        }}
                      >
                        Ghi nhận lại
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </Button>
                
                {Array.from({ length: totalPages }).map((_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(i + 1)}
                    className="w-9"
                  >
                    {i + 1}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </Button>
              </div>
            </div>
          )}
          
          {medicationLogs.length > 10 && (
            <div className="text-center text-sm text-muted-foreground">
              Hiển thị {(currentPage - 1) * itemsPerPage + 1} đến {Math.min(currentPage * itemsPerPage, medicationLogs.length)} trong tổng số {medicationLogs.length} bản ghi
            </div>
          )}
        </>
      )}
    </div>
  );
}
