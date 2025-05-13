"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

interface Medication {
  id: number;
  name: string;
  dosage: string;
}

interface MedicationLog {
  id: number;
  medication: Medication;
  taken_at: string;
  notes?: string;
  feeling_after?: string;
  created_at: string;
  user_id: number;
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
  const [medicationLogs, setMedicationLogs] = useState<MedicationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMedicationLogs();
  }, []);

  const fetchMedicationLogs = async () => {
    try {
      const response = await fetch("http://localhost:8001/api/medication-logs", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch medication logs");
      }

      const data = await response.json();
      setMedicationLogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error("Không thể tải lịch sử uống thuốc");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-center">
            <p>Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-center">
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Lịch sử uống thuốc</h1>

        {medicationLogs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-10">
              <p className="text-center text-muted-foreground">
                Chưa có lịch sử uống thuốc nào được ghi lại.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {medicationLogs.map((log) => (
              <Card key={log.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{log.medication.name}</CardTitle>
                      <CardDescription>
                        Liều lượng: {log.medication.dosage}
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
                      <p className="text-muted-foreground">{log.notes}</p>
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
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 