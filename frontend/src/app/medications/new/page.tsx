"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const BASE_URL_API = "http://localhost:8001";

export default function NewMedicationNotePage() {
  const [note, setNote] = useState("Hôm nay tôi uống paracetamol 500mg, và cảm thấy đỡ đau đầu hơn ");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<null | {
    medication_name: string;
    dosage: string;
    frequency: string;
    taken_at: string;
    feeling_after: string;
    saved: boolean;
  }>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch(`${BASE_URL_API}/api/ai/analyze-and-save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze note');
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error analyzing note:", error);
      // TODO: Hiển thị thông báo lỗi cho người dùng
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold">Tạo ghi chú thuốc mới</h1>

        <Card>
          <CardHeader>
            <CardTitle>Ghi chú thuốc</CardTitle>
            <CardDescription>
              Nhập thông tin về thuốc bằng văn bản tự do. AI sẽ tự động hiểu
              thông tin về tên thuốc, liều lượng và thời gian.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="mt-4">
              <div className="grid gap-4">
                <Textarea
                  placeholder="Ví dụ: Hôm nay tôi uống Paracetamol 500mg vào buổi sáng. Sau khi uống, tôi thấy đỡ đau đầu."
                  className="min-h-32"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between mt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => setNote("")}
              >
                Xóa
              </Button>
              <Button type="submit" disabled={isAnalyzing || !note.trim()}>
                {isAnalyzing ? "Đang phân tích..." : "Phân tích & Lưu"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {result && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Kết quả phân tích</CardTitle>
              <CardDescription>
                AI đã phân tích ghi chú của bạn và trích xuất thông tin sau:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                  <p className="font-medium">Tên thuốc:</p>
                  <p className="col-span-2">{result.medication_name}</p>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <p className="font-medium">Liều lượng:</p>
                  <p className="col-span-2">{result.dosage}</p>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <p className="font-medium">Tần suất:</p>
                  <p className="col-span-2">{result.frequency}</p>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <p className="font-medium">Thời gian uống:</p>
                  <p className="col-span-2">{result.taken_at}</p>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <p className="font-medium">Cảm nhận:</p>
                  <p className="col-span-2">{result.feeling_after}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                {result.saved
                  ? "✅ Thông tin đã được lưu vào hệ thống"
                  : "⚠️ Thông tin chưa được lưu vào hệ thống"}
              </p>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
} 