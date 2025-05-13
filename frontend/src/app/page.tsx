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

export default function Home() {
  return (
    <div className="container py-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
            Chào mừng đến với Health Reminder
          </h1>
          <p className="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Ứng dụng ghi chú thuốc thông minh với AI giúp bạn theo dõi và quản lý thuốc dễ dàng
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Ghi chú thuốc</CardTitle>
              <CardDescription>
                Nhập thông tin thuốc của bạn bằng văn bản tự do
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Nhập thông tin về loại thuốc, liều lượng, thời gian uống thuốc và AI
                sẽ tự động hiểu và lưu trữ thông tin.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/medications/new" className="w-full">
                <Button className="w-full">Tạo ghi chú thuốc</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lịch sử uống thuốc</CardTitle>
              <CardDescription>
                Xem lịch sử uống thuốc của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Theo dõi lịch sử thuốc đã uống, thời gian và cảm nhận sau khi
                dùng thuốc.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/logs" className="w-full">
                <Button variant="outline" className="w-full">
                  Xem lịch sử
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cảnh báo</CardTitle>
              <CardDescription>
                Nhận cảnh báo về tương tác thuốc
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Hệ thống AI phát hiện tương tác thuốc tiềm ẩn, chống chỉ định và
                cảnh báo quá liều.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/alerts" className="w-full">
                <Button variant="outline" className="w-full">
                  Xem cảnh báo
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Danh sách thuốc</CardTitle>
              <CardDescription>
                Quản lý các loại thuốc của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Xem thông tin chi tiết về tất cả thuốc bạn đang dùng, bao gồm liều lượng,
                tần suất sử dụng.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/medications" className="w-full">
                <Button variant="outline" className="w-full">
                  Xem thuốc của tôi
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
