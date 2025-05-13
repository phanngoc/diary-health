"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Dữ liệu mẫu cho cảnh báo
const alerts = [
  {
    id: 1,
    type: "interaction",
    severity: "high",
    medications: ["Paracetamol", "Ibuprofen"],
    description:
      "Paracetamol và Ibuprofen có thể gây tăng nguy cơ tác dụng phụ khi dùng chung với liều cao thường xuyên.",
  },
  {
    id: 2,
    type: "dosage",
    severity: "medium",
    medications: ["Paracetamol"],
    description:
      "Liều lượng Paracetamol đã vượt quá 3000mg trong ngày, có thể gây hại cho gan.",
  },
  {
    id: 3,
    type: "interaction",
    severity: "low",
    medications: ["Amoxicillin", "Loratadine"],
    description:
      "Có thể xảy ra tương tác nhẹ giữa Amoxicillin và Loratadine, cần theo dõi.",
  },
];

export default function AlertsPage() {
  // Hàm xác định màu dựa trên mức độ nghiêm trọng
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "low":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Hàm xác định icon dựa trên loại cảnh báo
  const getAlertIcon = (type: string) => {
    switch (type) {
      case "interaction":
        return "⚠️";
      case "dosage":
        return "💊";
      case "contraindication":
        return "🚫";
      default:
        return "ℹ️";
    }
  };

  // Hàm xác định tên loại cảnh báo
  const getAlertTypeName = (type: string) => {
    switch (type) {
      case "interaction":
        return "Tương tác thuốc";
      case "dosage":
        return "Quá liều";
      case "contraindication":
        return "Chống chỉ định";
      default:
        return "Cảnh báo";
    }
  };

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Cảnh báo</h1>

        {alerts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-10">
              <p className="text-center text-muted-foreground">
                Không có cảnh báo nào. Bạn đang sử dụng thuốc an toàn.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {alerts.map((alert) => (
              <Card
                key={alert.id}
                className={`border-l-4 ${
                  alert.severity === "high"
                    ? "border-l-red-500"
                    : alert.severity === "medium"
                    ? "border-l-yellow-500"
                    : "border-l-blue-500"
                }`}
              >
                <CardHeader>
                  <div className="flex items-start gap-2">
                    <div
                      className={`rounded-full p-2 text-center ${getSeverityColor(
                        alert.severity
                      )}`}
                    >
                      <span className="text-xl">{getAlertIcon(alert.type)}</span>
                    </div>
                    <div>
                      <CardTitle>
                        {getAlertTypeName(alert.type)}:{" "}
                        {alert.medications.join(" + ")}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>{alert.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 