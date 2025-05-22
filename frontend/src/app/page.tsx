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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CameraCapture } from "@/components/ui/camera-capture";
import { CameraIcon, TextIcon, LoadingSpinner } from "@/components/ui/icons";

const BASE_URL_API = "http://localhost:8001";

export default function Home() {
  const [note, setNote] = useState(
    "Hôm nay tôi uống paracetamol 500mg, và cảm thấy đỡ đau đầu hơn "
  );
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("text");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<null | {
    medication_name: string;
    dosage: string;
    frequency: string;
    taken_at: string;
    feeling_after: string;
    saved: boolean;
  }>(null);

  const handleImageCapture = (imageDataUrl: string) => {
    setCapturedImage(imageDataUrl);
  };

  const handleClearImage = () => {
    setCapturedImage(null);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate input based on active tab
    if (activeTab === "text" && !note.trim()) return;
    if (activeTab === "camera" && !capturedImage) return;

    setIsAnalyzing(true);
    try {
      let payload;
      if (activeTab === "text") {
        payload = { note };
      } else {
        // For camera mode, send the image as base64
        payload = { image: capturedImage };
      }

      const response = await fetch(
        `${BASE_URL_API}/api/ai/analyze-and-save`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to analyze input");
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error analyzing:", error);
      setError("Có lỗi xảy ra khi phân tích. Vui lòng thử lại sau.");
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
              Nhập thông tin hoặc chụp ảnh về thuốc. AI sẽ tự động hiểu
              thông tin về tên thuốc, liều lượng và thời gian.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleAnalyze}>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 w-full mb-4">
                  <TabsTrigger value="text" className="flex items-center gap-2">
                    <TextIcon size={16} />
                    <span>Nhập văn bản</span>
                  </TabsTrigger>
                  <TabsTrigger value="camera" className="flex items-center gap-2">
                    <CameraIcon size={16} />
                    <span>Chụp ảnh</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="text" className="mt-4">
                  <Textarea
                    placeholder="Ví dụ: Hôm nay tôi uống Paracetamol 500mg vào buổi sáng. Sau khi uống, tôi thấy đỡ đau đầu."
                    className="min-h-32"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </TabsContent>
                
                <TabsContent value="camera" className="mt-4">
                  {!capturedImage ? (
                    <CameraCapture onCapture={handleImageCapture} />
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="relative w-full max-w-md aspect-video bg-black rounded-md overflow-hidden">
                        <img 
                          src={capturedImage} 
                          alt="Captured medication" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <Button 
                        onClick={handleClearImage}
                        type="button"
                        variant="outline"
                        className="mt-4"
                      >
                        Chụp lại
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
              
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                  {error}
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-between mt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  if (activeTab === "text") {
                    setNote("");
                  } else {
                    handleClearImage();
                  }
                  setResult(null);
                }}
              >
                Xóa
              </Button>
              <Button 
                type="submit" 
                disabled={isAnalyzing || (activeTab === "text" && !note.trim()) || (activeTab === "camera" && !capturedImage)}
                className="flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <LoadingSpinner size={16} />
                    <span>Đang phân tích...</span>
                  </>
                ) : (
                  "Phân tích & Lưu"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {result && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Kết quả phân tích</CardTitle>
              <CardDescription>
                AI đã phân tích thông tin của bạn và trích xuất các chi tiết sau:
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
