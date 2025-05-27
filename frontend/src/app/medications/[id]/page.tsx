"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { apiClient } from "@/lib/apiClient";
import Link from "next/link";

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

export default function MedicationDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [medication, setMedication] = useState<Medication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    frequency: "",
    notes: "",
  });

  useEffect(() => {
    fetchMedication();
  }, [params.id]);

  // Set form data when medication data is loaded or changes
  useEffect(() => {
    if (medication) {
      setFormData({
        name: medication.name,
        dosage: medication.dosage,
        frequency: medication.frequency,
        notes: medication.notes || "",
      });
    }
  }, [medication]);

  const fetchMedication = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<Medication>(`/api/medications/${params.id}`);
      setMedication(response);
    } catch (err) {
      console.error("Error fetching medication:", err);
      setError("Không thể tải thông tin thuốc");
      toast.error("Không thể tải thông tin thuốc");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiClient.put<Medication>(`/api/medications/${params.id}`, formData);
      toast.success("Cập nhật thuốc thành công");
      setIsEditing(false);
      fetchMedication(); // Refresh data after update
    } catch (err) {
      console.error("Error updating medication:", err);
      toast.error("Không thể cập nhật thuốc");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsTaken = async () => {
    try {
      const response = await fetch("http://localhost:8001/api/medication-logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          medication_ids: [medication?.id],
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

  if (loading && !medication) {
    return (
      <div className="container py-8">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-center">
            <p>Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !medication) {
    return (
      <div className="container py-8">
        <div className="mx-auto max-w-2xl">
          <div className="flex flex-col items-center justify-center space-y-4">
            <p className="text-red-500">{error || "Không tìm thấy thuốc"}</p>
            <Button variant="outline" asChild>
              <Link href="/medications">Quay lại danh sách thuốc</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Chi tiết thuốc</h1>
          <div className="flex space-x-2">
            {!isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Chỉnh sửa
                </Button>
                <Button variant="default" onClick={handleMarkAsTaken}>
                  Ghi nhận đã dùng
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Hủy
              </Button>
            )}
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{isEditing ? "Chỉnh sửa thuốc" : medication.name}</CardTitle>
            {!isEditing && (
              <CardDescription>
                Liều lượng: {medication.dosage} - Tần suất: {medication.frequency}
              </CardDescription>
            )}
          </CardHeader>
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên thuốc</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dosage">Liều lượng</Label>
                  <Input
                    id="dosage"
                    name="dosage"
                    value={formData.dosage}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequency">Tần suất</Label>
                  <Input
                    id="frequency"
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Ghi chú</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={4}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </CardFooter>
            </form>
          ) : (
            <>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Tên thuốc</h3>
                    <p className="mt-1">{medication.name}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Liều lượng</h3>
                    <p className="mt-1">{medication.dosage}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Tần suất</h3>
                    <p className="mt-1">{medication.frequency}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Ghi chú</h3>
                    <p className="mt-1">{medication.notes || "Không có ghi chú"}</p>
                  </div>
                  <div className="pt-4">
                    <h3 className="font-medium text-sm text-muted-foreground">Ngày tạo</h3>
                    <p className="mt-1">{new Date(medication.created_at).toLocaleDateString("vi-VN")}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Lần cập nhật cuối</h3>
                    <p className="mt-1">{new Date(medication.updated_at).toLocaleDateString("vi-VN")}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild>
                  <Link href="/medications">Quay lại danh sách</Link>
                </Button>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
