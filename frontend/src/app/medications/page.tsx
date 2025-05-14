"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

interface Medication {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  user_id: number;
}

export default function MedicationsPage() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      const response = await fetch("http://localhost:8001/api/medications", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch medications");
      }

      const data = await response.json();
      setMedications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error("Không thể tải danh sách thuốc");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsTaken = async (medicationId: number) => {
    try {
      const response = await fetch("http://localhost:8001/api/medication-logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          medication_ids: [medicationId],
          taken_at: new Date().toISOString(),
          notes: "Đã uống thuốc"
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark medication as taken");
      }

      toast.success("Đã ghi nhận uống thuốc");
    } catch (err) {
      console.error("Error:", err);
      toast.error("Không thể ghi nhận uống thuốc");
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Danh sách thuốc của tôi</h1>
          <Link href="/medications/new">
            <Button>Thêm thuốc mới</Button>
          </Link>
        </div>

        {medications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-10">
              <p className="mb-4 text-center text-muted-foreground">
                Bạn chưa có thuốc nào được lưu trữ.
              </p>
              <Link href="/medications/new">
                <Button>Thêm thuốc mới</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {medications.map((medication) => (
              <Card key={medication.id}>
                <CardHeader>
                  <CardTitle>{medication.name}</CardTitle>
                  <CardDescription>
                    Liều lượng: {medication.dosage} - Tần suất:{" "}
                    {medication.frequency}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{medication.notes}</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Link href={`/medications/${medication.id}`}>
                    <Button variant="outline" size="sm">
                      Xem chi tiết
                    </Button>
                  </Link>
                  <Button 
                    size="sm"
                    onClick={() => handleMarkAsTaken(medication.id)}
                  >
                    Ghi nhận đã dùng
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 