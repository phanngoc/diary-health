"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./datepicker.css";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { apiClient } from "@/lib/apiClient";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  medication_ids: number[];
}

// Form schema
const formSchema = z.object({
  notes: z.string().optional(),
  feeling_after: z.string().optional(),
  taken_at: z.date({
    required_error: "Vui lòng chọn thời gian uống thuốc",
  }),
});

type FormValues = z.infer<typeof formSchema>;

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

export default function MedicationLogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [medicationLog, setMedicationLog] = useState<MedicationLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logId, setLogId] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notes: "",
      feeling_after: "",
      taken_at: new Date(),
    },
  });

  // Handle params resolution
  useEffect(() => {
    const resolveParams = async () => {
      try {
        const { id } = await params;
        console.log("Resolved params:", id);
        setLogId(parseInt(id, 10));
      } catch (err) {
        console.error("Error resolving params:", err);
        setError("Invalid medication log ID");
        setIsLoading(false);
      }
    };

    resolveParams();
  }, [params]);

  // Fetch medication log when logId and session are available
  useEffect(() => {
    if (session?.accessToken && logId) {
      fetchMedicationLog();
    }
  }, [session, logId]);

  // Populate form with medication log data when it's loaded
  useEffect(() => {
    if (medicationLog) {
      form.reset({
        notes: medicationLog.notes || "",
        feeling_after: medicationLog.feeling_after || "",
        taken_at: new Date(medicationLog.taken_at),
      });
    }
  }, [medicationLog, form]);

  const fetchMedicationLog = async () => {
    if (!logId) return;

    try {
      setIsLoading(true);
      const data = await apiClient.get<MedicationLog>(`/api/medication-logs/${logId}`);
      setMedicationLog(data);
    } catch (err) {
      console.error("Error fetching medication log:", err);
      setError("Không thể tải thông tin ghi chép thuốc. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (!medicationLog || !logId) return;

    try {
      setIsSubmitting(true);
      
      await apiClient.put(`/api/medication-logs/${logId}`, {
        notes: values.notes,
        feeling_after: values.feeling_after,
        taken_at: values.taken_at.toISOString(),
        medication_ids: medicationLog.medications.map(med => med.id),
      });

      toast.success("Đã cập nhật thông tin ghi chép thuốc thành công");
      router.push("/logs");
    } catch (err) {
      console.error("Error updating medication log:", err);
      toast.error("Không thể cập nhật thông tin ghi chép thuốc. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!logId || !confirm("Bạn có chắc chắn muốn xóa ghi chép thuốc này?")) return;

    try {
      setIsSubmitting(true);
      await apiClient.delete(`/api/medication-logs/${logId}`);
      toast.success("Đã xóa ghi chép thuốc thành công");
      router.push("/logs");
    } catch (err) {
      console.error("Error deleting medication log:", err);
      toast.error("Không thể xóa ghi chép thuốc. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="mx-auto max-w-3xl flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-10">
        <div className="mx-auto max-w-3xl">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Lỗi</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          
          <div className="mt-6 flex justify-center">
            <Button variant="outline" onClick={() => router.push("/logs")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!medicationLog) {
    return (
      <div className="container py-10">
        <div className="mx-auto max-w-3xl">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Không tìm thấy</AlertTitle>
            <AlertDescription>Không tìm thấy thông tin ghi chép thuốc này.</AlertDescription>
          </Alert>
          
          <div className="mt-6 flex justify-center">
            <Button variant="outline" onClick={() => router.push("/logs")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            className="mr-4" 
            onClick={() => router.push("/logs")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
          </Button>
          <h1 className="text-2xl font-bold">Chi tiết ghi chép thuốc</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <div>
                {medicationLog.medications.map(med => med.name).join(", ")}
              </div>
              <div className="text-sm bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-md px-2 py-1">
                {formatDate(medicationLog.taken_at)}
              </div>
            </CardTitle>
            <CardDescription>
              <div className="mt-4">
                <h3 className="font-medium mb-2">Thuốc đã sử dụng:</h3>
                <ul className="space-y-1 ml-4">
                  {medicationLog.medications.map(med => (
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
                  ))}
                </ul>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="taken_at"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Thời gian uống thuốc</FormLabel>
                      <FormControl>
                        <DatePicker
                          selected={field.value}
                          onChange={(date: Date | null) => field.onChange(date || new Date())}
                          showTimeSelect
                          dateFormat="dd/MM/yyyy HH:mm"
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          wrapperClassName="w-full"
                        />
                      </FormControl>
                      <FormDescription>
                        Thời gian bạn uống thuốc
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ghi chú</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Nhập ghi chú về việc uống thuốc (nếu có)"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Thông tin thêm về việc uống thuốc
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="feeling_after"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cảm nhận sau khi uống</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Cảm nhận của bạn sau khi uống thuốc (nếu có)"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Cảm nhận của bạn sau khi uống thuốc
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <p className="text-xs text-muted-foreground">
                  Đã tạo: {formatDate(medicationLog.created_at)} | Cập nhật lần cuối: {formatDate(medicationLog.updated_at)}
                </p>

                <div className="flex items-center justify-end space-x-4 pt-4">
                  <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={handleDelete}
                    disabled={isSubmitting}
                  >
                    Xóa
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="min-w-[100px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      'Lưu thay đổi'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
